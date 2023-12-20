const mongoose = require("mongoose");

const vslPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  actprice: {
    type: Number,
  },
  discountedprice: {
    type: Number,
  },
  date: {
    type: Date,
  },
  startdate: {
    type: Date,
  },
  enddate: {
    type: Date,
  },
  saletitle: {
    type: String,
  },
  description: {
    type: String,
  },
  gamepreview: {
    type: String,
  },
  bets: {
    type: Array,
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
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("vslPackage", vslPackageSchema);
