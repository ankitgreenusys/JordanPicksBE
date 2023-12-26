const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "package",
  },
  vslPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vslPackage",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  desc: {
    type: String,
  },
  price: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("orderHistory", orderHistorySchema);
