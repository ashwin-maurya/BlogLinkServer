const mongoose = require("mongoose");
const express = require("express");
const UserDetail = require("./UserDetails");
const { Schema } = mongoose;
const router = express.Router();
const feedbackSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserDetail,
  },
  type: {
    type: String,
    enum: ["complaint", "review", "bug"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
});
const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
