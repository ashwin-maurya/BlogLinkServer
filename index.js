const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");

connectToMongo();

const app = express();
const port = 5001;
app.use(cors());
app.use(express.json());

//available routes
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", require("./routes/auth"));

app.use("/api/blogs", require("./routes/blog"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/filter", require("./routes/filterAPIs"));
app.use("/api/feedback", require("./routes/feedback"));

app.listen(port, () => {
  console.log(`app listening at port http://localhost/${port}`);
});
