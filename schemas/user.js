const { string } = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

UserSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});
UserSchema.set("toJSON", {
    virtuals: true,
});

// 사전 hook , user. save 시 password 암호화 해서 저장
UserSchema.pre("save", function (next) {
    let user = this;
    if (user.isModified("password")) { //패스워드가 변경될때만 해싱작업이 처리됨.
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

// 해당 메소드 사용 시 기존과 비교 실시
UserSchema.methods.authenticate = function (password) {
    let user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", UserSchema);