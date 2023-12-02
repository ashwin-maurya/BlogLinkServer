const express = require("express");
const router = express.Router();
// const Blog = require("../models/Blog");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const blogCard = require("../models/BlogCard");
const blog = require("../models/BlogContent");
const UserDetail = require("../models/UserDetails");

// -----------------------------------------------------------------------------------------------------------------
// BLOGCONTENT APIS

// ROUTE 1. post Blog Content using : POST "api/blogs/postblogcontent"
router.post("/postblogcontent", fetchuser, async (req, res) => {
  try {
    const {

      description,
      userID,
      postID,
      Title,
      Category,
      tags,
      Blog_url,
    } = req.body;
    // If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog2 = new blog({
      description,
    });

    const savedblog = await blog2.save();
    // console.log(savedblog);
    const Blog = new blogCard({
      Title,
      userID,
      Category,
      tags,
      Blog_url,
      blogcontent: blog2._id,
      author: userID,
    });
    const savedblog2 = await Blog.save();
    // console.log(savedblog2);
    res.json(savedblog2);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// ROUTE 3: Put all a blog in the database : POST "/api/blogs/addblog"
router.post(
  "/addblogCard",
  fetchuser,

  async (req, res) => {
    try {
      const { userID, postID, Title, Category, UserName, tags, Blog_url } =
        req.body;

      // If there are errors , return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // console.log("hello");

        return res.status(400).json({ errors: errors.array() });
      }

      const blog = new blogCard({
        Title,
        postID,
        userID,
        author: userID,
        Category,
        tags,
        Blog_url,
        view: "0"
      });
      const savedblog = await blog.save();
      res.json(savedblog);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);
// ROUTE 2: Get Single blog content in the database : POST "/api/blogs/singleblogcontent"

router.post("/getsingleblogcontent", async (req, res) => {
  try {
    const { id } = req.body;
    const blogs = await blogCard
      .find({ _id: id })
      .populate("blogcontent")
      .populate("author");

    console.log(blogs);
    console.log("blogs descroption");
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

//------------------------------------------------------------------------------------------------------------------
//BLOGCARDS APIS
//ROUTE 1: Get all the blogs using : GET "/api/blogs/fetchallblogs". Login required
router.get("/fetchallblogCards", async (req, res) => {
  try {
    // console.log("hello");
    const blogs = await blogCard.find({}).populate("author");
    //   console.log(req.user.id)
    // console.log(blogs);
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// ROUTE 2: Put all a blog in the database : POST "/api/blogs/addblog"

router.get("/filterblog", async (req, res) => {
  try {
    const userID = req.query.userID;
    const blogs = await blogCard.find({ userID: userID });

    //   console.log(req.user.id)

    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

// ROUTE 3:Update an existing note using : POST "/api/notes/updatenote" .login required

router.put("/updateblog/:id", fetchuser, async (req, res) => {
  try {
    const { Title, blogcontent, tags, Category, Blog_url } = req.body;
    // let blog1 = await blogCard.find({ postID: req.params.id })

    const newblog = {};
    // const newblog = {};
    if (Title) {
      newblog.Title = Title;
    }

    if (tags) {
      newblog.tags = tags;
    }

    if (Category) {
      newblog.Category = Category;
    }
    if (Blog_url) {
      newblog.Blog_url = Blog_url;
    }


    // Find the note to be updated and update it
    let Blog = await blogCard.find({ _id: req.params.id });
    let Blog2 = await blog.find({ _id: blogcontent?._id });
    if (!Blog || !Blog2) {
      return res.status(404).send("not found");
    }

    //   if (blog.user.toString() !== req.user.id) {
    //     return res.status(401).send("Not Alowed");
    //   }

    Blog = await blogCard.findOneAndUpdate(
      { _id: req.params.id },
      { $set: newblog },
      { new: true }
    );
    Blog2 = await blog.findOneAndUpdate(
      { _id: blogcontent?._id },
      { $set: { description: blogcontent?.description } },
      { new: true }
    );
    res.json({ Blog, Blog2 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});


// ROUTE 4:Delete an existing note using : DELETE "/api/notes/deletenote" .login required

router.delete("/deleteblog/:id", async (req, res) => {
  try {
    // Find the note to be deleted and delete it
    let blog1 = await blogCard.find({ _id: req.params.id })
    if (!blog1) {
      return res.status(404).send("not found");
    }

    //Allow deletion only if user owns it
    // if (blog1.user.toString() !== req.user.id) {
    //   return res.status(401).send("Not Alowed")
    // }

    blog1 = await blogCard.findOneAndDelete({ _id: req.params.id }).populate('blogcontent');
    console.log(blog1.blogcontent)
    let blog2 = await blog.findOneAndDelete({ _id: blog1.blogcontent._id });

    console.log(blog1)
    console.log(blog2)
    return res.json({
      success: "note has been deleted",
      blog1: blog1,
      blog2: blog2,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});

//getuserimg
router.get("/userImg/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const blogs = await UserDetail.find({ userID: userID });

    //   console.log(req.user.id)
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Sever error,Something in the way");
  }
});
// ROUTE: Search for the top 10 results based on views
router.get("/searchForResults/:searchtext", async (req, res) => {
  try {
    const searchtext = req.params.searchtext; // Access the parameter from req.params
    const searchResults = await blogCard
      .find({ Title: { $regex: searchtext, $options: "i" } }).populate('author')
      .sort({ view: -1 })
      .limit(10);

    if (searchResults.length > 0) {
      res.json({ available: true, results: searchResults });
    } else {
      res.json({ available: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});
router.get("/fetchrandomblog", async (req, res) => {
  try {
    const totalBlogs = await blogCard.countDocuments();
    const randomIndex = Math.floor(Math.random() * totalBlogs);
    const randomBlog = await blogCard.findOne().populate('author').skip(randomIndex).exec();

    if (randomBlog) {
      res.json(randomBlog);
    } else {
      res.json({ message: "No blogs found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

module.exports = router;
