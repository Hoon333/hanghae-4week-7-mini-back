const mongoose = require("mongoose");
const moment = require("moment");

const commentSchema = new mongoose.Schema({
  article_id: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: moment().format("YYYY-MM-DD hh:mm"),
    required: true,
  },
});

commentSchema.virtual("commentId").get(function () {
  return this._id.toHexString();
});
commentSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Comment", commentSchema);
