const express = require("express");
const mongoose = require("mongoose");
const loginRouter = require("./routes/login")
const articleRouter = require("./routes/articles")
const commentRouter = require("./routes/comments")
const cors = require("cors");
const authMiddleware = require("./middlewares/auth-middleware")

mongoose.connect("mongodb://localhost:27017/response2019", {
  ignoreUndefined: true ,
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();

app.use(cors());
app.use("/api", express.urlencoded({ extended: false }), [loginRouter, articleRouter,commentRouter]);



app.get("/",(req,res)=>{
    res.send("hi")
})



app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});