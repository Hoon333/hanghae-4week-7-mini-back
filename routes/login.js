const express = require("express")
const router = express.Router()
const User = require("../schemas/user")
const Joi = require("joi")
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middlewares/auth-middleware")


router.get("/", (req,res)=>{
    res.send("This is api page")
})

router.get("/login", (req,res)=>{
    res.send("This is login page")
})






// nickname, password 검증 스키마(joi 활용)
// const postUsersSchema = Joi.object({
//     nickname: Joi.string().min(3).pattern(new RegExp('[a-zA-Z0-9]')).required(),
//     password: Joi.string().min(4).required(),
//     confirmPassword:Joi.string().min(4).required()
// })

// // 회원가입 API 완성
// router.post("/users", async(req,res)=>{
//     try{
//         const {nickname, password,confirmPassword} = await postUsersSchema.validateAsync(req.body)

//         if(password !== confirmPassword){
//             res.status(400).send({
//                 errorMessage: "비밀번호와 비밀번호확인이 일치하지 않습니다."
//             })
//             return
//         } else if(password.includes(nickname)){
//             res.status(400).send({
//                 errorMessage: "비밀번호에 닉네임과 같은 값을 포함할 수 없습니다."
//             })
//             return
//         }
    
//         const existUsers = await User.find({nickname})
//         if(existUsers.length){
//             res.status(400).send({
//                 errorMessage: "중복된 닉네임입니다."
//             })
//             return
//         }
    
//         const user = new User({nickname , password})
//         await user.save()
    
//         res.send({}) 

//     }catch(err){
//         console.log(err)
//         res.status(400).send({
//             errorMessage: err.message
//         })
//         return
//     }


   
// })

// // 로그인 API 작성

// router.post("/auth",async(req,res)=>{
    
//     const {nickname,password} = req.body

//     const user = await User.findOne({nickname,password})

//     if(!user){
//         res.status(401).send({
//             errorMessage: "nickname 또는 password가 일치하지 않습니다."
//         })
//         return
//     }

//     const token = jwt.sign({userId:user.userId},"my-secret-key")
//     res.send({token})

// })

// // 로그인 확인 API 작성

// router.get("/users/me", authMiddleware, async(req,res)=>{
//     console.log(res.locals.user.userId)
//     const {user} = res.locals
//     res.send({
//         user:{
//             userId:user.userId
//         }
//     })
// })

// router.get("/users/find", async(req,res)=>{
//     const {authorization} = req.headers
//     const [tokenType,tokenValue] = authorization.split(' ')
//     try {
//         const {userId} = jwt.verify(tokenValue,"my-secret-key")
//         console.log(userId)
//         const user = await User.findById(userId)
//         res.send({
//             nickname: user.nickname
//         })

//     } catch (error) {
//         res.send({
//             errorMessage: '잘못된 접근입니다.'
//         })
//     }
    
// })





module.exports = router