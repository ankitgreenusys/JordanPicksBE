const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // date: {
  //   type: Date,
  //   required: true,
  // },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gamePreview: {
    type: String,
    required: true,
  },
  bets: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  runningStatus: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("package", packageSchema);
