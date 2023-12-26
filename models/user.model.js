const mongoose = require("mongoose");

const user = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
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
  bonus: {
    type: Boolean,
    default: false,
  },
  package: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "package",
    },
  ],
  vslPackage: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vslPackage",
    },
  ],
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
