const express = require("express");
const User = require("../models/User");
const Userdetail = require("../models/UserDetails");
const router = express.Router();
const { body, validator, validationResult } = require("express-validator");
const bycrypt = require("bcryptjs");
var fetchuser = require("../middleware/fetchuser");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "YouwillDieforThat";
const blogCard = require("../models/BlogCard");
const blog = require("../models/BlogContent");
const moment = require('moment');


// API:TO GET RELEVANT FORM DATABASE


// 


// })



router.put("/updateViews", async (req, res) => {
    try {


        // Use the $gte operator for views greater than or equal to minViews
        const result = await blogCard.find({ views: { $gte: 0 } }).toArray();

        console.log(result)
        res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Sever error,Something in the way");
    }
});


router.post('/sortByViews/:interval', async (req, res) => {
    try {
        const { interval } = req.params;
        console.log(interval)
        let startDate;
        if (interval === 'week') {
            startDate = moment().subtract(1, 'weeks').toDate();
        } else if (interval === 'month') {
            startDate = moment().subtract(1, 'months').toDate();
        } else if (interval === 'year') {
            startDate = moment().subtract(1, 'years').toDate();
        } else if (interval === 'all') {
            startDate = moment(0).toDate(); // Start of time
        } else {
            return res.status(400).json({ error: 'Invalid interval' });
        }

        // Find and sort blogCards based on views and the specified time interval
        const sortedBlogCards = await blogCard.find({ Date: { $gte: startDate } }).populate('author')
            .sort({ view: -1 })


        res.json(sortedBlogCards);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





router.post("/getRelevantBlogs", fetchuser, async (req, res) => {

    try {

        // const { keywords } = ;

        console.log(typeof req.body.data)
        // Create a text index on the fields you want to search


        // Use the $text operator for text search with $in operator to match any keyword
        const result = await blogCard.find({ Category: { $in: ["Javascript", "python"] } }).populate('author');
        // return result;
        console.log(result)
        res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Sever error,Something in the way");
    }
})



router.get("/getAllCategories", async (req, res) => {
    try {
        // Use find to retrieve all documents, but only project the "category" field
        const result = await blogCard.find({}, { Category: 1 });

        console.log(result);
        res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error, Something in the way");
    }
});

router.get('/getlatestblogs', async (req, res) => {
    try {
        // Specify the date range (e.g., the last 7 days)
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        // Find and sort blogCards based on the creation date
        const latestBlogCards = await blogCard.find({ Date: { $gte: startDate } }).populate("author").sort({ Date: -1 }) // Sort by creation date in descending order

        res.json(latestBlogCards);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getlikecount', async (req, res) => {
    try {

        const postId = req.body.id

        const likescount = await



            res.json(likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




router.put("/getCategoryBlogs", async (req, res) => {

    try {
        const category = req.body.category;
        console.log(category)
        const blogs = await blogCard.find({ Category: category });

        res.json(blogs);


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


module.exports = router;
