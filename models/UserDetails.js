const mongoose = require("mongoose");
const express = require("express");
const { Schema } = mongoose;
const router = express.Router();
const UserSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
  },
  description: {
    type: String,
  },
  education: {
    type: String,
  },
  work: {
    type: String,
  },
  location: {
    type: String,
  },
  profileImg: {
    type: String,
  },
  bannerImg: {
    type: String,
  },

  socialLinks: {
    type: Object,
  },
  relevant: {
    type: [String],
  },
  bookmarks: [
    {
      type: mongoose.Types.ObjectId,
      ref: "blogCard",
    },
  ],
});

const UserDetail = mongoose.model("UserDetail", UserSchema);
// User.createIndexes();

module.exports = UserDetail;
// module.exports = router;
