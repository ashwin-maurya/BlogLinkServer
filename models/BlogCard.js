const mongoose = require("mongoose");
const { Schema } = mongoose;
const BlogCardSchema = new mongoose.Schema({
  postID: {
    type: String,
    // required: true
  },
  userID: {
    type: String,
    // required: true
  },

  Title: {
    type: String,
    // required: true
  },


  Category: {
    type: String,
    // required: true
  },
  tags: [],

  Blog_url: {
    type: String,
    // required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetail",
  },

  blogcontent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blog",
  },

  comment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],





  view: {
    type: String,
    default: "0",
  },
  Date: {
    default: Date.now,
    type: Date,
  },
});

module.exports = mongoose.model("blogCard", BlogCardSchema);
