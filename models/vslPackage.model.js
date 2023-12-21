const mongoose = require("mongoose");

const vslPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  actPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  saleTitle: {
    type: String,
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
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bet",
      },
    ],
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
