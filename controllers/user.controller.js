const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const userModel = require("../models/user.model");
const vslPackageModel = require("../models/vslPackage.model");
const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const { emailValidation } = require("../validations/joi");
const fs = require("fs");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, username } = req.body;

    if (!email) {
      return res.status(404).json({ msg: "email required" });
    }

    const { error } = emailValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ifUser = await userModel.findOne({ email });
    if (ifUser) {
      return res.status(400).json({ error: "email already exists" });
    }

    const ifusername = await userModel.findOne({ username });
    if (ifusername) {
      return res.status(400).json({ error: "username already exists" });
    }

    // if (ifUser && !ifUser.isVerified)
    //   await userModel.findByIdAndDelete({ _id: ifUser._id });

    // const verificationCode = Math.floor(100000 + Math.random() * 900000);
    // const otpExpires = Date.now() + 10 * 60 * 1000;

    // const otpresult = await sendOTP(
    //   email,
    //   verificationCode,
    //   "Verify your email"
    // );

    // if (!otpresult.messageId)
    //   return res.status(500).json({ error: "Something went wrong with OTP" });

    // if (ifUser && ifUser.isVerified) {
    //   ifUser.verificationCode = verificationCode;
    //   ifUser.otpExpires = otpExpires;
    //   await ifUser.save();
    //   return res.status(200).json({
    //     success: "otp send success",
    //     id: ifUser._id,
    //     otp: verificationCode,
    //   });
    // }
    // const data = {
    //   email,
    //   verificationCode,
    //   otpExpires,
    // };
    // const newUser = await userModel.create(data);

    // return res.status(201).json({
    //   success: "otp send success",
    //   id: ifUser._id,
    //   otp: verificationCode,
    // });

    const newUser = await userModel.create({
      name,
      email,
      mobile: phone,
      password,
      username,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN_PRIVATE_KEY,
      {
        expiresIn: "1y",
      }
    );

    const newuser = newUser.toObject();

    newuser.token = token;
    newuser.refreshToken = refreshToken;

    return res
      .status(201)
      .json({ msg: "User created successfully", dta: newuser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

// routes.verifyOTP = async (req, res) => {
//   try {
//     // const _id = req.params.id;
//     const _id = req.body._id;
//     const verificationCode = parseInt(req.body.verificationCode);

//     if (!verificationCode)
//       return res.status(404).json({ error: "otp required" });

//     const user = await userModel.findById(_id);

//     if (!user) return res.status(404).json({ error: "user not found" });

//     if (
//       user.verificationCode !== verificationCode ||
//       Date.now() > user.otpExpires
//     ) {
//       return res.status(400).json({ error: "otp InValid" });
//     }

//     if (user.name) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });
//       const refreshToken = jwt.sign(
//         { id: user._id },
//         process.env.REFRESH_TOKEN_PRIVATE_KEY,
//         {
//           expiresIn: "1y",
//         }
//       );
//       const newuser = user.toObject();
//       newuser.token = token;
//       newuser.refreshToken = refreshToken;
//       return res.status(200).json({ newuser });
//     }

//     user.isVerified = true;
//     const result = await user.save();

//     const newUser = result.toObject();
//     newUser.token = null;

//     return res.status(200).json({ newUser, success: "Verified" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "internal server error" });
//   }
// };

routes.resendOtp = async (req, res) => {
  try {
    const _id = req.params.id;

    const user = await userModel.findById(_id);
    if (!user) return res.status(404).json({ error: "user not found" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const otpresult = await sendOTP(
      user.email,
      verificationCode,
      "Verify your email"
    );

    user.verificationCode = verificationCode;
    user.otpExpires = otpExpires;
    await user.save();
    return res.status(200).json({ success: "otp send success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
