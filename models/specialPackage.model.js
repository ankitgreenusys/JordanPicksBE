const mongoose = require("mongoose");

const specialPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
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
  links: {
    type: Array,
  },
  discount: {
    type: Number,
    default: 0,
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: function () {
      return Date.now();
    },
  },
});

module.exports = mongoose.model("specialPackage", specialPackageSchema);
