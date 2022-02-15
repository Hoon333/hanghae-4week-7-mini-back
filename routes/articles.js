
const express = require("express");
const router = express.Router();

// Schemas
const Article = require("../schemas/article");
const Comment = require("../schemas/comment");
const User = require("../schemas/user");

// MiddleWares
const authMiddleware = require("../middlewares/auth-middleware");
const { upload } = require("../middlewares/upload")

// delete obj in S3 module
const deleteS3 = require("../middlewares/deleteS3")

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
			return res.status(400).send({
				errorMessage: "자기 글만 삭제할 수 있습니다.",
			});
		} else {
			await deleteS3(existArticle);
			await Article.deleteOne({ _id: articleId });
		}
	}
	res.json({ result: "success", msg: "삭제되었습니다." });
});


// 게시글 작성 완성 authmiddlware넣고 user_id 주석 제거 152줄의 user_id 제거
router.post("/articles", upload.single("image"), authMiddleware, async (req, res) => {
	try {
		//const user_id = "미들웨어에서 가져올 예정" 로그인 기능완료 후 구현예정
		const { user_id } = res.locals.user
		const { title, content, year } = req.body; //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정
		const image = req.file.location;
		const createdArticle = await Article.create({
			user_id,
			title,
			content,
			year: Number(year),
			image,
		});
		res.json({ result: "success", msg: "작성 완료 되었습니다." });
	} catch (err) {
		res.status(400).json({ result: "fail", msg: "파일이 없습니다." });
	}
});

// 게시글 수정 API 통과 // req.files.length =>   url 삭제, url 등록, 수정 ?
router.post("/articles/:articleId", upload.array("image", 1), authMiddleware, async (req, res) => {
	const { user_id } = res.locals.user
	const { articleId } = req.params;
	const existArticle = await Article.findOne({ _id: articleId });

	let image = "";

	if (req.files.length) {
		await deleteS3(existArticle);
		image = req.files[0].location;
	}

	const { title, content, year } = req.body;
	//authmiddleware 작업 끝나면 자기글만 수정가능하도록 변경 예정
	if (existArticle) {
		if (user_id !== existArticle.user_id) {
			return res.status(400).send({
				result: "fail",
				errorMessage: "자기글만 수정할 수 있습니다.",
			});
		} else {
			await Article.updateOne({ _id: articleId }, { $set: { title, content, year, image } });
			console.log('게시글 수정 완료!')
		}
	}
	res.json({ result: "success", msg: "수정되었습니다." });
}
);

module.exports = router;
