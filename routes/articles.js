const dotenv = require('dotenv');
dotenv.config();

const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const User = require("../schemas/user")
const authMiddleware = require("../middlewares/auth-middleware")
const jwt = require("jsonwebtoken")
const path = require('path');
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')




const multer = require('multer');
const fs = require('fs');

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}


AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2"
})

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'rednada1708',
        key(req, file, cb) {
            cb(null, `orginal/${Date.now()}${path.basename(file.originalname)}`)
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});


router.get("/articles", async (req, res) => {
    const articles = await Article.find({})
    res.json({ result: "success", articles })
})


router.get("/articles/:articleId", async (req, res) => {
    const { articleId } = req.params
    const article = await Article.findOne({ _id: articleId })
    res.json({ result: "success", article: [article] })
})

router.put("/articles/:articleId", async (req, res) => {
    console.log('수정요청 들어왔어')
    const { articleId } = req.params
    const { title, content, year } = req.body
    console.log(title, content, year)
    //authmiddleware 작업 끝나면 자기글만 수정가능하도록 변경 예정
    const existArticle = await Article.find({ _id: articleId })
    console.log(existArticle)
    if (existArticle.length) {
        await Article.updateOne({ _id: articleId }, { $set: { title, content, year } })
    }
    res.json({ result: 'success', msg: '수정되었습니다.' })
})





router.delete("/articles/:articleId", async (req, res) => {
    console.log('삭제요청 들어왔어')
    const { articleId } = req.params
    console.log(articleId)
    //authmiddleware 작업 끝나면 자기글만 삭제가능하도록 변경 예정 작업3
    const existArticle = await Article.find({ _id: articleId })
    if (existArticle.length) {
        await Article.deleteOne({ _id: articleId })
    }
    res.json({ result: 'success', msg: '삭제되었습니다.' })
})




router.post("/articles", upload.single('image'), async (req, res) => {
    //const user_id = "미들웨어에서 가져올 예정" 로그인 기능완료 후 구현예정 
    const { user_id, title, content, year } = req.body //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정
    const image = req.file.location
    const date = new Date()
    const createdArticle = await Article.create({ user_id, title, content, year: Number(year), image, date })
    res.json({ result: "success", msg: '작성 완료 되었습니다.' })
})






// router.get("/articles", async(req,res)=>{
//     const existArticles = await Articles.find()
//     const articles = existArticles.sort((a,b)=>b.date-a.date)
//     res.render("main",{articles:articles})
// })

// router.get("/articles/:articleId", async(req,res)=>{
//     const {user} = req.query
//     const {articleId} = req.params
//     const articles = await Articles.findOne({articleId:Number(articleId)})
//     //const status = (articles.nickname === )
//     const existComment = await Comment.find({articleId})
//     const existLike = await Like.find({articleId})
//     const totalLike = existLike.length
//     const myLike = await Like.findOne({articleId,nickname:user})
//     let statusLike
//     if(myLike){
//         statusLike = true
//     } else{
//         statusLike = false
//     }
//     const comments = existComment.sort((a,b)=>b.date-a.date)
//     res.render("detail",{articles,user,comments,totalLike,statusLike})
// })

// router.get("/articles/:articleId/reform", async(req,res)=>{
//     const {articleId} = req.params
//     console.log(articleId)
//     const articles = await Articles.findOne({articleId:Number(articleId)})
//     res.render("reform",{articles})
// })



// router.post("/articles", authMiddleware, async(req,res)=>{
//     const {user} = res.locals
//     const {title, content} = req.body

//     const nickname = user.nickname
//     const password = user.password

//     console.log(user, title,content)
//     const date = new Date()

//     const articles = await Articles.find()
//     const ids = articles.map((item)=>item.articleId)
//     let articleId = 1
//     if (ids.length !== 0){
//         articleId = Math.max(...ids) + 1
//     }

//     const createdArticle = await Articles.create({articleId,title,nickname,password,content,date})
//     res.json({ result : "작성완료" })
// })


// //댓글작성 API 
// router.post("/articles/:articleId/comment",authMiddleware,async(req,res)=>{
//     const {content} =req.body
//     const {articleId} = req.params
//     const {nickname} = res.locals.user
//     console.log(content,articleId,nickname)
//     const date = new Date()

//     //comment Id 생성버튼
//     const existComment = await Comment.find()
//     const ids = existComment.map((item)=>item.commentId)
//     let commentId = 1
//     if (ids.length !== 0){
//         commentId = Math.max(...ids) + 1
//     }
//     //comment Id 생성버튼
//     const comment = new Comment({content,articleId,nickname,date,commentId})
//     await comment.save()
//     res.send({result:"작성완료"})
// })

// // 좋아요 기능 구현

// router.post("/articles/:articleId/like",authMiddleware, async(req,res)=>{
//     const {nickname} = res.locals.user
//     const {articleId} = req.params
//     const {like} = req.body
//     console.log('좋아요 눌렸나?')
//     if(like==="false"){
//         await Like.deleteOne({nickname,articleId})
//         res.send({result:'좋아요 취소'})
//     } 
//     if(like==="true"){
//         const newLike = new Like({nickname,articleId})
//         await newLike.save()
//         res.send({result:'좋아요 완료'})
//     }

// })







// router.put("/articles/:articleId", authMiddleware, async(req,res)=>{
//     console.log('수정 요청 받았습니다.')
//     const {nickname} = res.locals.user
//     const {articleId} = req.params
//     const {title,content} = req.body
//     const [oldArticle] = await Articles.find({articleId:Number(articleId)})
//     console.log(oldArticle.nickname)
//     if (nickname !== oldArticle.nickname ){
//         res.status(400).send({
//             errorMessage: "자기글만 수정할 수 있습니다."
//         })
//         return  
//     }
//     const date = new Date()
//     await Articles.updateOne({articleId:Number(articleId)},{$set:{title,content,date}})
//     res.send({result:'수정완료'})
// })


// router.put("/comment/:commentId", authMiddleware, async(req,res)=>{
//     const {nickname} = res.locals.user
//     const {commentId} = req.params
//     const {content} = req.body
//     const existComment = await Comment.findOne({commentId})
//     if(existComment.nickname===nickname){
//         await Comment.updateOne({commentId:Number(commentId)},{$set:{content}})
//     }
//     res.send({result:'수정완료'})
// })

// router.delete("/comment/:commentId", authMiddleware, async(req,res)=>{
//     const {nickname} = res.locals.user
//     const {commentId} = req.params
//     const existComment = await Comment.findOne({commentId})
//     if(existComment.nickname===nickname){
//         await Comment.deleteOne({commentId})
//     }
//     res.send({result:'삭제완료'})
// })







// router.delete("/articles/:articleId", authMiddleware, async(req,res)=>{
//     const {nickname} = res.locals.user
//     const {articleId} = req.params
//     const [oldArticle] = await Articles.find({articleId:Number(articleId)})
//     console.log(oldArticle.nickname)
//     if (nickname !== oldArticle.nickname ){
//         res.status(400).send({
//             errorMessage: "자기글만 삭제할 수 있습니다."
//         })
//         return  
//     }
//     await Articles.deleteOne({articleId})
//     res.json({result:'삭제완료'})
// })








module.exports = router