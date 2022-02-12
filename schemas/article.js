const mongoose = require("mongoose");
const moment = require("moment");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: moment().format("YYYY-MM-DD hh:mm"),
        required: true
    }
})

articleSchema.virtual("articleId").get(function () {
    return this._id.toHexString();
});
articleSchema.set("toJSON", {
    virtuals: true,
});


module.exports = mongoose.model("Articles", articleSchema)
