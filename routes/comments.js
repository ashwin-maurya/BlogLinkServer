const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const Bookmark = require("../models/BookmarkSchema");
const Comment = require("../models/Comments");
const blogCard = require("../models/BlogCard");
const Userdetail = require("../models/UserDetails");
const { default: mongoose } = require("mongoose");
const Like = require("../models/LikeSchema");
const CommentLike = require("../models/CommentLike");

// ROUTE 3: Put all a blog in the database : POST "/api/blogs/addblog"
router.post(
  "/addcomment",
  fetchuser,

  async (req, res) => {
    try {
      const {
        userID,
        postID,
        comment,
        // UserName
      } = req.body;

      // If there are errors , return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const commentdata = new Comment({
        // UserName,

        author: userID,
        text: comment,
        parentId: postID,
      });
      const savedcomment = await commentdata.save();

      const blog = await blogCard.findByIdAndUpdate(
        postID,
        { $push: { comment: savedcomment._id } },
        { new: true }
      );

      const updateblog = await blog.save();
      res.json(savedcomment);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);

// adding reply
router.post(
  "/addreply",
  fetchuser,

  async (req, res) => {
    try {
      const {
        userID,
        id,
        reply,
        // UserName
      } = req.body;

      // If there are errors , return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const commentdata = new Comment({
        // UserName,

        author: userID,
        text: reply,
        parentId: id,
      });
      const savedcomment = await commentdata.save();

      let comments = await Comment.findByIdAndUpdate(
        id,
        { $push: { children: savedcomment._id } },
        { new: true }
      );

      res.json({ comments });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);

router.get("/getreply/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate({
      path: "children",
      populate: [
        {
          path: "author",
          // model: User,
        },
        {
          path: "children",
          model: "Comment",
          populate: {
            path: "author",
            // model: User,
            // select: "_id id name parentId image"
          },
        },
      ],
    });
    res.json(comment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// ROUTE 3:Update an existing note using : POST "/api/notes/updatenote" .login required

router.put("/editcoment/:id", fetchuser, async (req, res) => {
  try {
    const { comment } = req.body;
    const newcomment = {};
    if (comment) {
      newcomment.comment = comment;
    }

    // Find the note to be updated and update it
    let comments = await Comment.findById(req.params.id);
    if (comments) {
      return res.status(404).send("not found");
    }

    //   if (blog.user.toString() !== req.user.id) {
    //     return res.status(401).send("Not Alowed");
    //   }

    comments = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: newcomment },
      { new: true }
    );
    res.json({ comments });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// ROUTE 4:Delete an existing note using : DELETE "/api/notes/deletenote" .login required

router.delete("/deletecomment/:id", async (req, res) => {
  try {
    // Find the note to be deleted and delete it
    let comment = await Comment.findById(req.params.id);

    if (comment) {
      return res.status(404).send("not found");
    }

    //Allow deletion only if user owns it
    // if (blog1.user.toString() !== req.user.id) {
    //   return res.status(401).send("Not Alowed")
    // }

    comment = await Comment.findByIdAndDelete(req.params.id);

    return res.json({ success: "note has been deleted", comment: comment });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.get("/getallcommentsbypostID/:id", async (req, res) => {
  try {
    const comment = await blogCard.findById(req.params.id).populate({
      path: "comment",
      populate: [
        {
          path: "author",
          model: Userdetail,
        },
        {
          path: "children",
          model: "Comment",
          populate: {
            path: "author",
            model: Userdetail,
            // select: "_id id name parentId image"
          },
        },
      ],
    });
    res.json(comment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/postViews/:id", async (req, res) => {
  const { view } = req.body;
  let view2 = parseInt(view);
  view2 = view2 + 1;

  let blog1 = await blogCard.findById({ _id: req.params.id });
  if (!blog1) {
    return res.status(404).send("not found");
  }

  blog1 = await blogCard.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { view: view2 } },
    { new: true }
  );

  res.json(blog1);
});

router.put("/addbookmark", async (req, res) => {
  try {
    let { postID, userID, postIDString } = req.body;
    let bookmark = await Bookmark.findOne({ userId: userID });
    if (!bookmark) {
      bookmark = await Bookmark.create({
        userId: userID,
        postId: postID,
        postIDString: postID,
      });
      return res.json(bookmark);
    }

    if (bookmark.postId.includes(postID)) {
      return res.status(400).json({ error: "Post is already bookmarked" });
    }

    const newbookmark = await Bookmark.findOneAndUpdate(
      { userId: userID },
      {
        $push: {
          postId: postID,
          postIDString: postID,
        },
      }
    );

    const book = newbookmark.save();

    res.json(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/deletebookmark", async (req, res) => {
  try {
    let { postID, userID } = req.body;
    let bookmark = await Bookmark.findOne({ userId: userID });

    if (!bookmark) {
      return res.json("Not found user");
    }

    const newbookmark = await Bookmark.findOneAndUpdate(
      { userId: userID },
      {
        $pull: {
          postId: postID,
          postIDString: postID,
        },
      }
    );

    res.json(newbookmark);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/getbookmark", fetchuser, async (req, res) => {
  try {
    let user = await Bookmark.findOne({ userId: req.body.data }).populate({
      path: "postId",
      model: blogCard,
      populate: {
        path: "author",
        model: Userdetail,
      },
    });

    // let bk = await Userdetail.findOne({ userID: req.body.data })
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});
router.put("/checkbookmark", fetchuser, async (req, res) => {
  try {
    let user = await Bookmark.findOne({
      userId: req.body.userId,
      postIDString: { $in: req.body.postId },
    });

    // let bk = await Userdetail.findOne({ userID: req.body.data })

    if (user) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});
router.put("/checklike", fetchuser, async (req, res) => {
  try {
    console.log(req.body);

    let user = await Like.findOne({
      userId: req.body.userId,
      postIDString: { $in: req.body.postId },
    });

    // let bk = await Userdetail.findOne({ userID: req.body.data })

    if (user) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// router.put("/removeBookmark", async (req, res) => {

router.put("/addcommentlike", async (req, res) => {
  try {
    console.log(req.body);

    let { commentID, userID } = req.body;
    let bookmark = await CommentLike.findOne({ userId: userID });

    if (!bookmark) {
      bookmark = await CommentLike.create({
        userId: userID,
        commentId: commentID,
        commentIDString: commentID,
        status: "liked",
      });

      return res.json(bookmark);
    }

    if (bookmark.commentId.includes(commentID)) {
      return res.status(400).json({ error: "Post is already bookmarked" });
    }

    const newbookmark = await CommentLike.findOneAndUpdate(
      { userId: userID },
      {
        $push: {
          commentId: commentID,
          commentIDString: commentID,
        },
      }
    );

    const book = newbookmark.save();

    res.json(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/dislike", async (req, res) => {
  try {
    let { commentID, userID } = req.body;
    let bookmark = await CommentLike.findOne({
      userId: userID,
      commentId: commentID,
    });

    if (!bookmark) {
      return res.json("Not found user");
    }

    const newbookmark = await CommentLike.findOneAndUpdate(
      { userId: userID, commentId: commentID },
      {
        $pull: {
          commentId: commentID,
          commentIDString: commentID,
        },
      }
    );
    // const book = newbookmark.save()
    res.json(newbookmark);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/deletecommentlike", async (req, res) => {
  try {
    console.log("deletecomment");
    console.log(req.body);
    let { commentID, userID } = req.body;
    let bookmark = await CommentLike.findOne({ commentId: commentID });

    if (!bookmark) {
      return res.json("Not found user");
    }

    const newbookmark = await CommentLike.findOneAndUpdate(
      { userId: userID },
      {
        $pull: {
          commentId: commentID,
          commentIDString: commentID,
        },
      }
    );

    // const book = newbookmark.save()

    res.json(newbookmark);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/countcommentlike", async (req, res) => {
  try {
    console.log("count");
    console.log(req.body.data);

    const count = await CommentLike.find({
      commentIDString: { $in: [req.body.data] },
    }).count();
    // let bk = await Userdetail.findOne({ userID: req.body.data })
    console.log(count);
    res.json(count);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/addlike", async (req, res) => {
  try {
    console.log("add like");
    console.log(req.body);
    let { postID, userID, postIDString } = req.body;
    let bookmark = await Like.findOne({ userId: userID });

    if (!bookmark) {
      bookmark = await Like.create({
        userId: userID,
        postId: postID,
        postIDString: postID,
      });

      return res.json(bookmark);
    }

    if (bookmark.postId.includes(postID)) {
      return res.status(400).json({ error: "Post is already bookmarked" });
    }

    const newbookmark = await Like.findOneAndUpdate(
      { userId: userID },
      {
        $push: {
          postId: postID,
          postIDString: postID,
        },
      }
    );

    const book = newbookmark.save();

    res.json(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/deletelike", async (req, res) => {
  try {
    let { postID, userID } = req.body;
    let bookmark = await Like.findOne({ userId: userID });

    if (!bookmark) {
      return res.json("Not found user");
    }

    const newbookmark = await Like.findOneAndUpdate(
      { userId: userID },
      {
        $pull: {
          postId: postID,
          postIDString: postID,
        },
      }
    );

    // const book = newbookmark.save()

    res.json(newbookmark);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/countlike", async (req, res) => {
  try {
    const count = await Like.find({ postId: { $in: [req.body.data] } }).count();
    // let bk = await Userdetail.findOne({ userID: req.body.data })
    res.json(count);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/checkcommentlike", fetchuser, async (req, res) => {
  try {
    let user = await CommentLike.findOne({
      userId: req.body.userId,
      commentIDString: { $in: req.body.commentId },
    });

    // let dislikeuser=await

    if (user) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/countbookmark", async (req, res) => {
  try {
    const count = await Bookmark.find({
      postId: { $in: [req.body.data] },
    }).count();
    // let bk = await Userdetail.findOne({ userID: req.body.data })
    res.json(count);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

router.put("/editcomment", async (req, res) => {
  try {
    console.log(req.body);
    const data = await Comment.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          text: req.body.reply,
          isEdited: true,
          Date: Date.now(),
        },
      }
    );

    console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

module.exports = router;
