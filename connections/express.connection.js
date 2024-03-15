const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("../routes/user.route");
const adminRouter = require("../routes/admin.route");
const morgan = require("morgan");

const initializeTask = require("../initializeTask");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/admin", adminRouter);
app.use("/user", userRouter);

app.use("/test", (req, res) => {
  res.send("Hello World!");
});

app.get("*", (req, res) => {
  res.status(404).json("invalid request");
});

app.use("/", (req, res) => {
  return res.send("working");
});

const startserver = () => {
  try {
    app.listen(PORT, () => {
      initializeTask();
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = startserver;
