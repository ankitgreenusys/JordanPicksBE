const Joi = require("joi");

const addVehicleValidation = Joi.object({
  vehicleNumber: Joi.string().required(),
  chassisNumber: Joi.string().required(),
  engineNumber: Joi.string().required(),
  hypotheticationRC: Joi.boolean().required(), 
  BankNOCImage: Joi.string(), 
  insuranceValid: Joi.boolean().required(), 
  insuranceImage: Joi.string(), 
  otherDocument: Joi.boolean().required(),
  otherDocumentImage: Joi.string()
});

const emailValidation = Joi.object({
  email: Joi.string().email().required(),
});

const registerValidation = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  mobile: Joi.string().required(),
  city: Joi.string().required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createAdminValidation = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  addVehicleValidation,
  emailValidation,
  registerValidation,
  loginValidation,
  createAdminValidation,
};
// export {
//   addVehicleValidation,
//   emailValidation,
//   registerValidation,
//   loginValidation,
//   createAdminValidation,
// };
