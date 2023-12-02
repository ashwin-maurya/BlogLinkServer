const jwt = require("jsonwebtoken");
// const router = require("../routes/auth")
const JWT_SECRET = "YouwillDieforThat";
const fetchuser = (req, res, next) => {
  //Get the user from the jwt token and add id to req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({
      error: "please from middleware authenticate using a valid token",
    });

    return;
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);

    req.user = data.user;

    // res.send(req.user)

    next();
  } catch (error) {
    res
      .status(401)
      .send({ error: "please authenticate catch using a valid token" });
  }
};
// module.exports=router
module.exports = fetchuser;
