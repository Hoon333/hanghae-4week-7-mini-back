const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const Comment = require("../schemas/comment");
const User = require("../schemas/user");
const authMiddleware = require("../middlewares/auth-middleware");
const jwt = require("jsonwebtoken");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

const multer = require("multer");
const fs = require("fs");

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "rednada1708",
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/img", async (req, res) => {
  const articles = await Article.find({});
  res.json({ result: "success", articles });
});


router.get("/articles", async (req, res) => {
  const articles = await Article.find({});
  res.json({ result: "success", articles });
});

router.get("/articles/:articleId", async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findOne({ _id: articleId });
  res.json({ result: "success", article: [article] });
});

router.put("/articles/:articleId", async (req, res) => {
  console.log("수정요청 들어왔어");
  const { articleId } = req.params;
  const { title, content, year } = req.body;
  console.log(title, content, year);
  //authmiddleware 작업 끝나면 자기글만 수정가능하도록 변경 예정
  const existArticle = await Article.find({ _id: articleId });
  console.log(existArticle);
  if (existArticle.length) {
    await Article.updateOne(
      { _id: articleId },
      { $set: { title, content, year } }
    );
  }
  res.json({ result: "success", msg: "수정되었습니다." });
});

//게시글 삭제 기능 구현 완료 
router.delete("/articles/:articleId", authMiddleware,async (req, res) => {
    const {user_id} = res.locals.user
    const { articleId } = req.params;
    const existArticle = await Article.findOne({ _id: articleId });
    if (existArticle) {
      if(existArticle.user_id !== user_id){
        res.status(401).send({
          errorMessage: "자기 글만 삭제할 수 있습니다.",
        });
        return;
      } else{
        const key = "original/" + decodeURI(existArticle.image.split("/").slice(-1))
        let s3 = new AWS.S3()
        s3.deleteObject({
            Bucket: 'rednada1708', // 사용자 버켓 이름
            Key: key // 버켓 내 경로
          }, (err, data) => {
            if (err) { throw err; }
            console.log('s3 deleteObject 삭제완료' )
        })
        await Article.deleteOne({ _id: articleId });
        }
    }
    res.json({ result: "success", msg: "삭제되었습니다." })
});

router.post("/articles", upload.single("image"), async (req, res) => {
  //const user_id = "미들웨어에서 가져올 예정" 로그인 기능완료 후 구현예정
  const { user_id, title, content, year } = req.body; //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정
  const image = req.file.location;
  const date = new Date();
  const createdArticle = await Article.create({
    user_id,
    title,
    content,
    year: Number(year),
    image,
    date,
  });
  res.json({ result: "success", msg: "작성 완료 되었습니다." });
});

module.exports = router;
