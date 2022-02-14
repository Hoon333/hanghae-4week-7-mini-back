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

AWS.config.update({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	region: "ap-northeast-2",
});

const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname);
	if (
		ext !== ".jpg" &&
		ext !== ".jpeg" &&
		ext !== ".png" &&
		ext !== ".gif" &&
		ext !== ".jfif"
	) {
		return cb({ message: "이미지 파일만 전송가능합니다." }, false);
	}
	cb(null, true);
};

const upload = multer({
	storage: multerS3({
		s3: new AWS.S3(),
		bucket: "rednada1708",
		key(req, file, cb) {
			cb(
				null,
				`original/${Date.now()}${path.basename(file.originalname)}`
			);
		},
	}),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: fileFilter,
});

// 전체 게시글 조회 API 통과
router.get("/articles", async (req, res) => {
	const existArticles = await Article.find({});
	const articles = existArticles.sort((a, b) => b.date - a.date);
	res.json({ result: "success", articles });
});

// 특정 게시글 조회 API 통과
router.get("/articles/:articleId", async (req, res) => {
	const { articleId } = req.params;
	const article = await Article.findOne({ _id: articleId });
	res.json({ result: "success", article: [article] });
});

//게시글 전체 삭제 기능 구현 완료 통과
router.delete("/articles/:articleId", authMiddleware, async (req, res) => {
	const { user_id } = res.locals.user;
	const { articleId } = req.params;
	const existArticle = await Article.findOne({ _id: articleId });
	if (existArticle) {
		if (existArticle.user_id !== user_id) {
			res.status(400).send({
				errorMessage: "자기 글만 삭제할 수 있습니다.",
			});
			return;
		} else {
			const key =
				"original/" +
				decodeURI(existArticle.image.split("/").slice(-1));
			let s3 = new AWS.S3();
			s3.deleteObject(
				{
					Bucket: "rednada1708", // 사용자 버켓 이름
					Key: key, // 버켓 내 경로
				},
				(err, data) => {
					if (err) {
						throw err;
					}
					console.log("s3 deleteObject 삭제완료");
				}
			);
			await Article.deleteOne({ _id: articleId });
		}
	}
	res.json({ result: "success", msg: "삭제되었습니다." });
});


// 게시글 작성
router.post("/articles", authMiddleware,upload.single("image"), async (req, res) => {
	try {
		const {user_id} = res.locals.user
		const { title, content, year } = req.body; //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정
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
	} catch (err) {
		res.status(400).json({ result: "fail", msg: "파일이 없습니다." });
	}
});

// 게시글 수정 API 통과 // req.files.length =>   url 삭제, url 등록, 수정 ?
router.post(
	"/articles/:articleId",
	authMiddleware,
	upload.array("image", 1),
	async (req, res) => {
		const { articleId } = req.params;
		const {user_id} = res.locals.user
		const existArticle = await Article.findOne({ _id: articleId });
		let image = "";
		if (req.files.length) {
			const key =
				"original/" +
				decodeURI(existArticle.image.split("/").slice(-1));
			let s3 = new AWS.S3();
			s3.deleteObject(
				{
					Bucket: "rednada1708", // 사용자 버켓 이름
					Key: key, // 버켓 내 경로
				},
				(err, data) => {
					if (err) {
						throw err;
					}
					console.log("s3 deleteObject 삭제완료");
				}
			);
			image = req.files[0].location;
		} else {
			image = existArticle.image
		}
		console.log(image)
		const { title, content, year } = req.body;
		//authmiddleware 작업 끝나면 자기글만 수정가능하도록 변경 예정
		if (existArticle) {
			if (user_id !== existArticle.user_id) {
				res.status(400).send({
					result: "fail",
					errorMessage: "자기글만 수정할 수 있습니다.",
				});
				return;
			} else {
				console.log("수정할 자격있다.");
				await Article.updateOne(
					{ _id: articleId },
					{ $set: { title, content, year, image } }
				);
			}
		}
		res.json({ result: "success", msg: "수정되었습니다." });
	}
);

module.exports = router;
