const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const User = require("../schemas/user");
const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/auth-middleware");
const jwt = require("jsonwebtoken");

router.get("/comment", (req, res) => {
  res.send("This is comment page");
});

module.exports = router;
