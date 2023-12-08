const express = require("express");
const User = require("../models/User");
const Userdetail = require("../models/UserDetails");
const router = express.Router();
const { body, validator, validationResult } = require("express-validator");
const bycrypt = require("bcryptjs");
var fetchuser = require("../middleware/fetchuser");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "YouwillDieforThat";
//ROUTE:1 Create a user using : POST "/api/auth/createuser". No login required

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let success = false;
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }
      const salt = await bycrypt.genSalt(10);
      let secPass = await bycrypt.hash(req.body.password, salt);

      //create a new user
      user = await User.create({
        username: req.body.username,
        name: req.body.name,
        password: secPass,
        email: req.body.email,
        isGoogleSignup: false,
        userDetailId: "",
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({
        success: success,
        authtoken: authtoken,
        UserID: user.id,
        username: user.username,
        isGoogleSignup: user.isGoogleSignup,
        userDetailId: user.userDetailId,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error, Something in the way");
    }
    // .then(user=>res.json(user)).catch(err=>{
    //     console.log(err)
    //     res.json({error:'please enter a unique value for email',message:err.message})
    // })
  }
);
router.post("/addUserDetailIdToUsers", async (req, res) => {
  try {
    const { userID, userDetailId } = req.body;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userDetailId = userDetailId;

    await user.save();

    // Include userDetailId in the response
    res.json({
      success: true,
      authtoken: req.headers["auth-token"], // Assuming you want to include the existing auth-token
      UserID: user.id,
      userDetailId: user.userDetailId,
      username: user.username,
      isGoogleSignup: user.isGoogleSignup,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error, Something went wrong");
  }
});

//ROUTE:1 Create a user using : POST "/api/auth/createuser". No login required

router.post(
  "/googlesignup",
  [body("email", "Enter a valid Email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let success = false;
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }
      //create a new user
      user = await User.create({
        username: username,
        name: req.body.name,
        password: "",
        email: req.body.email,
        isGoogleSignup: true,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({
        success: success,
        authtoken: authtoken,
        UserID: user.id,
        username: user.username,
        isGoogleSignup: user.isGoogleSignup,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something  in the way");
    }
  }
);

//ROUTE:2 Authenticate a user using : POST "/api/auth/login". No login required

router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let success = false;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordcompare = await bycrypt.compare(password, user.password);
      if (!passwordcompare) {
        return res.status(400).json({
          success: success,
          error: "Please try to login with correct credentials",
        });
      }
      success = true;
      const payload = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
      res.json({
        success: true,
        authtoken: authtoken,
        UserID: user.id,
        userDetailId: user.userDetailId,
        isGoogleSignup: user.isGoogleSignup,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);

router.post(
  "/googlelogin",
  [body("email", "Enter a valid Email").isEmail()],
  async (req, res) => {
    // If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
      let success = false;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      success = true;
      const payload = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
      res.json({
        success: true,
        authtoken: authtoken,
        UserID: user.id,
        userDetailId: user.userDetailId,
        isGoogleSignup: user.isGoogleSignup,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);

// ROUTE:3 Get loggedin user details susing : POST "/api/auth/getuser".  login required
router.get("/getCurrentuser", fetchuser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internl server error ,SOmething in the way");
  }
});

// ROUTE:3 Get loggedin user details susing : POST "/api/auth/getuser".  login required
router.get("/getCurrentuserDetails/:userID", async (req, res) => {
  try {
    const userID = req.params.userID; // Access username from query parameter
    const userDetail = await Userdetail.findOne({ userID: userID });

    res.json(userDetail);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, Something in the way");
  }
});

router.get("/getuser", async (req, res) => {
  try {
    const username = req.query.username;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);

    res.status(500).send("Internal server error, something went wrong");
  }
});

router.get("/userexist", async (req, res) => {
  try {
    const email = req.query.email;
    // Use findOne to find a user by their username
    const user = await User.findOne({ email: email });

    if (user) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});
router.get("/userdetailexist", async (req, res) => {
  try {
    const userID = req.query.userID;
    const user = await Userdetail.findOne({ userID: userID });

    if (user) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

router.post("/adduserdetail", fetchuser, async (req, res) => {
  try {
    const {
      userID,
      username,
      description,
      work,
      education,
      location,
      profileImg,
      bannerImg,
      socialLinks,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let existingUserDetails = await Userdetail.findOne({ userID });

    if (existingUserDetails) {
      return res.status(409).json({ message: "User details already exist." });
    }

    const newUserDetails = new Userdetail({
      userID,
      username,
      description,
      work,
      education,
      location,
      profileImg,
      bannerImg,
      socialLinks,
    });

    const createdUserDetails = await newUserDetails.save();
    res.json(createdUserDetails);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error, S1omething went wrong");
  }
});

router.put("/updateuserdetail/:userID", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { description, work, education, location } = req.body;
    const { userID } = req.params;

    const updatedUserDetails = {};
    if (description) {
      updatedUserDetails.description = description;
    }
    if (work) {
      updatedUserDetails.work = work;
    }
    if (education) {
      updatedUserDetails.education = education;
    }
    if (location) {
      updatedUserDetails.location = location;
    }

    let existingUserDetails = await Userdetail.findOne({ userID });

    if (!existingUserDetails) {
      return res.status(404).json({ msg: "User details not found" });
    }

    existingUserDetails = await Userdetail.findOneAndUpdate(
      { userID },
      { $set: updatedUserDetails },
      { new: true }
    );

    success = true;
    res.json({ success, updatedUserDetails });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error, Something went wrong");
  }
});

// adding profile/bannerimg
router.post(
  "/addimg",
  fetchuser,

  async (req, res) => {
    try {
      const { key, imgUrl, userID } = req.body;

      let details = await Userdetail.findOne({ userID: userID });
      if (!details) {
        return res.status(404).send("not found");
      }

      details = await Userdetail.findOneAndUpdate(
        { userID: userID },
        { $set: { [key]: imgUrl } },
        { new: true }
      );

      res.json({ details });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever error,Something in the way");
    }
  }
);

// Add this route to update the username
router.put("/updateUsername/:userId", fetchuser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;
    // Check if the new username is available
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Update the username for the user with the given userId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );

    res.json({ user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

// Add this route to check username availability
router.get("/checkUsernameAvailability", async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ username });

    if (user) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

// Add this route to update the user's password
router.put("/updatePassword/:userId", fetchuser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bycrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});
router.put("/setpassword/:userId", fetchuser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.isGoogleSignup = false;
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

// Update social links for a user
router.put("/updateSocialLinks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { socialLinks } = req.body;
    const userDetail = await Userdetail.findOne({ userID: userId });

    if (!userDetail) {
      return res.status(404).json({ message: "UserDetail not found" });
    }

    userDetail.socialLinks = socialLinks;

    await userDetail.save();

    res.json({ message: "Social links updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});
// Update social links for a user
router.put("/updateRelevant/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { relevant } = req.body;
    const userDetail = await Userdetail.findOne({ userID: userId });

    if (!userDetail) {
      return res.status(404).json({ message: "UserDetail not found" });
    }

    userDetail.relevant = relevant;

    await userDetail.save();

    res.json({ message: "Social links updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error, something went wrong");
  }
});

module.exports = router;
