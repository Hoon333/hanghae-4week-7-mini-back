const express = require("express");
const mongoose = require("mongoose");
const loginRouter = require("./routes/login");
const articleRouter = require("./routes/articles");
const commentRouter = require("./routes/comments");
const cors = require("cors");
const path = require("path");
const authMiddleware = require("./middlewares/auth-middleware");

// mongoose.connect("mongodb://localhost:27017/response2019", {
//   ignoreUndefined: true ,
// }); // mongodb 연결
mongoose.connect("mongodb://localhost/response2009", {
  // 1-6 몽고 DB연결과정 localhost의 todo-demo에 연결하겠다.
  useNewUrlParser: true, // 1-6 몽고 DB연결과정
  useUnifiedTopology: true, // 1-6 몽고 DB연결과정
  ignoreUndefined: true,
});

const db = mongoose.connection; // 1-6 몽고 DB연결과정
db.on("error", console.error.bind(console, "connection error:")); // 1-6 몽고 DB연결과정

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets")));
app.use("/api", express.urlencoded({ extended: false }), [
  loginRouter,
  articleRouter,
  commentRouter,
]);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/assets/index.html"));
});

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
