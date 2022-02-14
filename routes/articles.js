const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const Comment = require("../schemas/comment");
const User = require("../schemas/user");
const authMiddleware = require("../middlewares/auth-middleware");
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

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname)
  if( ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".gif" && ext !== ".jfif"){
    return cb({message:"이미지 파일만 전송가능합니다."}, false)
  }
  cb(null, true)
}

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "rednada1708",
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});


// 전체 게시글 조회 API 통과
router.get("/articles", async (req, res) => {
  const existArticles = await Article.find({});
  const articles = existArticles.sort((a,b)=>(b.date-a.date))
  res.json({ result: "success", articles });
});

// 특정 게시글 조회 API 통과
router.get("/articles/:articleId", async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findOne({ _id: articleId });
  res.json({ result: "success", article: [article] });
});

// 게시글 수정 API 통과 // req.files.length =>   url 삭제, url 등록, 수정 ?     
router.put("/articles/:articleId", authMiddleware, async (req, res) => {
  console.log("수정요청 들어왔어");
  const {user_id} = res.locals.user
  console.log(user_id)
  const { articleId } = req.params;
  const { title, content, year, image } = req.body;
  //authmiddleware 작업 끝나면 자기글만 수정가능하도록 변경 예정
  const existArticle = await Article.findOne({ _id: articleId });
  console.log(existArticle)
  if (user_id !== existArticle.user_id ){
    res.status(400).send({
        result : 'fail',
        errorMessage: "자기글만 수정할 수 있습니다."
    })
    return  
  }
  await Article.updateOne({ _id: articleId }, { $set: { title, content, year, image } } );
  if (existArticle.length) {
    await Article.updateOne(
      { _id: articleId },
      { $set: { title, content, year, image } }
    );
  }
  res.json({ result: "success", msg: "수정되었습니다." });
});

//게시글 전체 삭제 기능 구현 완료 통과 
router.delete("/articles/:articleId", authMiddleware,async (req, res) => {
    const {user_id} = res.locals.user
    const { articleId } = req.params;
    const existArticle = await Article.findOne({ _id: articleId });
    if (existArticle) {
      if(existArticle.user_id !== user_id){
        res.status(400).send({
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


// S3에 이미지 등록 api 통과
router.post("/image", upload.array("image",1), (req, res) => {
  // try{


  // } catch(err){
  //   res.status(400).json({ result : "fail" , msg : '파일 개수가 맞지 않습니다.'})
  // }
  console.log(req.files)
  if(req.files.length){
    const image = req.files[0].location
    console.log(image)
    res.json({ result: "success", msg: "파일 업로드가 완료되었습니다.", url: image});
  } else{
    console.log('바뀐 파일이 없습니다.')
    res.json({ result: "success", msg: "바뀐 파일이 없습니다."});
  }
});

//s3의 이미지 삭제 api 통과
// router.delete("/image/:articleId", authMiddleware, async(req, res) => {
//   const {user_id} = res.locals.user
//   const {image} = req.body
//   console.log(image)
//   const { articleId } = req.params;
//   const existArticle = await Article.findOne({ _id: articleId });
//   if(existArticle && (existArticle.user_id === user_id)){
//     const key = "original/" + decodeURI(image.split("/").slice(-1))
//     let s3 = new AWS.S3()
//     s3.deleteObject({
//         Bucket: 'rednada1708', // 사용자 버켓 이름
//         Key: key // 버켓 내 경로
//       }, (err, data) => {
//         if (err) { throw err; }
//         console.log('s3 deleteObject 삭제완료' )
//     })
//   }
//   res.json({ result: "success", msg: "파일 삭제가 완료되었습니다."});
// });




// 게시글 작성 완성 authmiddlware넣고 user_id 주석 제거 152줄의 user_id 제거
router.post("/articles", upload.single("image"), async (req, res) => {
  try {
    //const user_id = "미들웨어에서 가져올 예정" 로그인 기능완료 후 구현예정
    //const {user_id} = res.locals.user  
    const {user_id, title, content, year } = req.body; //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정 
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
  } catch(err){
    res.status(400).json({ result : "fail" , msg : '파일이 없습니다.'})
  }
});

module.exports = router;
