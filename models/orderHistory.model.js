const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "package",
  },
  vslPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vslPackage",
  },
  date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("orderHistory", orderHistorySchema);
