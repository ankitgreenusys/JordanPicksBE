const mongoose = require("mongoose");

const user = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  username: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: Number,
  },
  otpExpires: {
    type: Date,
  },
  password: {
    type: String,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "package",
  },
  vslPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vslPackage",
  },
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderHistory",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("user", user);
//  mongoose.model("user", user);
