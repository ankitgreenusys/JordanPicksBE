const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    enum: ["win", "lose", "tie", "pending"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("bet", betSchema);
