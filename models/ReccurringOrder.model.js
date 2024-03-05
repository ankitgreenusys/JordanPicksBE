const mongoose = require("mongoose");

const reccuringOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SpecialPackage",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: function () {
      return Date.now();
    },
  },
});
