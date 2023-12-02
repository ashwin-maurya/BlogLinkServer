const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
var fetchuser = require("../middleware/fetchuser");

router.post("/submitFeedback", fetchuser, async (req, res) => {
  try {
    const { userID, type, description, rating } = req.body;
    const newFeedback = new Feedback({
      author: userID,
      type,
      description,
      rating,
    });

    await newFeedback.save();

    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/getReviews", async (req, res) => {
  try {
    const reviews = await Feedback.find({ type: "review" }).populate("author");
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
module.exports = router;
