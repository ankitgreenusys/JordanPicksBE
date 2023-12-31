const Joi = require("joi");

const createAdminValidation = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changeUserBalanceValidation = Joi.object({
  wallet: Joi.number().required(),
});

const addPackageValidation = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  bets: Joi.array().required(),
  description: Joi.string().required(),
  gamePreview: Joi.string().required(),
  endDate: Joi.string().required(),
  videoURL: Joi.string().uri().required(),
});

const addVslPackageValidation = Joi.object({
  name: Joi.string().required(),
  actPrice: Joi.number().required(),
  discountedPrice: Joi.number().required(),
  bets: Joi.array().required(),
  description: Joi.string().required(),
  gamePreview: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  saleTitle: Joi.string().required(),
  videoURL: Joi.string().uri().required(),
});

const updatePackageStatusValidation = Joi.object({
  status: Joi.string().required(),
  result: Joi.string().required(),
});

const updateVslPackageStatusValidation = Joi.object({
  status: Joi.string().required(),
  result: Joi.string().required(),
});

const updatePackageValidation = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  bets: Joi.array().required(),
  description: Joi.string().required(),
  gamePreview: Joi.string().required(),
  endDate: Joi.string().required(),
  // url
  videoURL: Joi.string().uri().required(),
});

const updateVslPackageValidation = Joi.object({
  name: Joi.string().required(),
  actPrice: Joi.number().required(),
  discountedPrice: Joi.number().required(),
  bets: Joi.array().required(),
  description: Joi.string().required(),
  gamePreview: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  saleTitle: Joi.string().required(),
  videoURL: Joi.string().uri().required(),
});

module.exports = {
  createAdminValidation,
  loginValidation,
  changeUserBalanceValidation,
  addPackageValidation,
  addVslPackageValidation,
  updatePackageStatusValidation,
  updateVslPackageStatusValidation,
  updatePackageValidation,
  updateVslPackageValidation,
};
