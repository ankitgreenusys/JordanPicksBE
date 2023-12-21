const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./routes/user.route");
const adminRouter = require("./routes/admin.route");
const path = require("path");
const morgan = require("morgan");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGODB_URI || "";

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use(express.static("public/images"));

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/", (req, res) => {
  return res.send("working");
});
app.use("/test", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    })
  )
  .catch((err) => console.log(err));
