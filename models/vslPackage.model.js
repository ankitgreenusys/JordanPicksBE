const mongoose = require("mongoose");

const vslPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  actprice: {
    type: Number,
    required: true,
  },
  discountedprice: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
    required: true,
  },
  saletitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gamepreview: {
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
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("vslPackage", vslPackageSchema);
