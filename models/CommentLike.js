const mongoose = require("mongoose");

const { Schema } = mongoose;
const CommentlikeSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  commentId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  commentIDString: { type: Array },
});

module.exports = mongoose.model("CommentLike", CommentlikeSchema);
