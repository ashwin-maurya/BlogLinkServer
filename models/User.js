const mongoose = require("mongoose");
const express = require("express");
const { Schema } = mongoose;
const router = express.Router();
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userDetailId: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  isGoogleSignup: {
    type: Boolean,
  },
  Date: {
    default: Date.now,
    type: Date,
  },
});
const User = mongoose.model("user", UserSchema);
// User.createIndexes();

module.exports = User;
// module.exports = router;
