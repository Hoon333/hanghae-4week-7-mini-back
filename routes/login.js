const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../schemas/user");
const Joi = require("joi");
const authMiddleware = require("../middlewares/auth-middleware");
const { boolean } = require("joi");


router.get("/", (req, res) => {
    res.send("This is api page")
})


// 회원가입 API
// register -> users 로 바꾸고 싶음

router.post("/register", async (req, res) => {
    const { user_id, password } = req.body;

    // if (password !== confirmPassword) {
    //     res.status(400).send({
    //         errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    //     });
    //     return;
    // }

    const existsUsers = await User.findOne({ user_id });
    if (existsUsers) {
        // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
        res.status(400).send({
            errorMessage: "ID가 이미 사용중입니다.",
        });
        return;
    }

    const user = new User({ user_id, password });
    await user.save();

    res.status(201).send({ result: 'success', msg: '회원가입에 성공하였습니다.' });

});

// ID 중복 확인 API
router.get("/users/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const existsUsers = await User.findOne({ user_id });
    if (existsUsers) {
        // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
        res.status(400).send({
            errorMessage: "ID가 이미 사용중입니다.",
        });
        return;
    } else {
        res.status(201).send({ result: 'success', msg: '사용 가능한 ID 입니다.' });
    }
});

// 로그인 API
router.post("/auth", async (req, res) => {
    const { user_id, password } = req.body;
    let check_password = boolean;
    const user = await User.findOne({ user_id });
    if (user) {
        check_password = await user.compare(password)
    }
    // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
    if (!user || !check_password) {
        res.status(400).send({
            errorMessage: "ID 또는 패스워드가 틀렸습니다.",
        });
        return;
    }

    res.send({
        token: jwt.sign({ userId: user.userId }, "response-2009-secret-key"),
    });
});




module.exports = router