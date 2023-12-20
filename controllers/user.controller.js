const userModel = require("../models/user.model");
const vehicleModel = require("../models/vehicle.model");
const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const {
  addVehicleValidation,
  emailValidation,
  registerValidation,
} = require("../validations/joi");
const fs = require("fs");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json("email required");
    }

    const { error } = emailValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ifUser = await userModel.findOne({ email });

    if (ifUser && !ifUser.isVerified)
      await userModel.findByIdAndDelete({ _id: ifUser._id });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const otpresult = await sendOTP(
      email,
      verificationCode,
      "Verify your email"
    );

    if (!otpresult.messageId)
      return res.status(500).json({ error: "Something went wrong with OTP" });

    if (ifUser && ifUser.isVerified) {
      ifUser.verificationCode = verificationCode;
      ifUser.otpExpires = otpExpires;
      await ifUser.save();
      return res.status(200).json({
        success: "otp send success",
        id: ifUser._id,
        otp: verificationCode,
      });
    }
    const data = {
      email,
      verificationCode,
      otpExpires,
    };
    const newUser = await userModel.create(data);

    return res
      .status(201)
      .json({
        success: "otp send success",
        id: ifUser._id,
        otp: verificationCode,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.verifyOTP = async (req, res) => {
  try {
    // const _id = req.params.id;
    const _id = req.body._id;
    const verificationCode = parseInt(req.body.verificationCode);

    if (!verificationCode)
      return res.status(404).json({ error: "otp required" });

    const user = await userModel.findById(_id);

    if (!user) return res.status(404).json({ error: "user not found" });

    if (
      user.verificationCode !== verificationCode ||
      Date.now() > user.otpExpires
    ) {
      return res.status(400).json({ error: "otp InValid" });
    }

    if (user.name) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_PRIVATE_KEY,
        {
          expiresIn: "1y",
        }
      );
      const newuser = user.toObject();
      newuser.token = token;
      newuser.refreshToken = refreshToken;
      return res.status(200).json({ newuser });
    }

    user.isVerified = true;
    const result = await user.save();

    const newUser = result.toObject();
    newUser.token = null;

    return res.status(200).json({ newUser, success: "Verified" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

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

routes.regestration = async (req, res) => {
  try {
    const { name, mobile, city, _id } = req.body;
    // const _id = req.params.id;
    const user = await userModel.findById(_id);
    if (!user) return res.status(404).json({ error: "user not found" });

    const { error } = registerValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!user.isVerified)
      return res.status(404).json({ error: "user is not verified" });

    if (user.vehicles.length > 0) {
      return res.status(404).json({ error: "user already registered" });
    }

    user.name = name;
    user.mobile = mobile;
    user.city = city;
    user.vehicles = [];

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //   const refreshToken = generateRefreshToken({
    //     _id: user._id,
    // });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_PRIVATE_KEY,
      {
        expiresIn: "1y",
      }
    );

    //   res.cookie("jwt", refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    // });

    return res.status(200).json({ token, refreshToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.refreshAccessTokenController = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken)
    return res.status(401).send("Access denied, token missing!");

  console.log("refressh", refreshToken);

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const id = decoded.id;
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).send({ accessToken });

    // return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.status(401).send("Invalid refresh token");
    // return res.send(error(401, "Invalid refresh token"));
  }
};

routes.addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, chassisNumber, engineNumber,hypotheticationRC, insuranceValid, otherDocument, } = req.body;
    const _id = req.userId;

    const { error } = addVehicleValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findById(_id);
    if (!user) return res.status(404).json({ error: "user not found" });

    const rcImage = req.file ? req.file.path : null;
    const insuranceImage = req.files
    const BankNOCImage = req.files
    const otherDocumentImage = req.files

    const data = {
      vehicleOwner: user._id,
      vehicleNumber,
      chassisNumber,
      engineNumber,
      hypotheticationRC, 
      BankNOCImage, 
      insuranceValid, 
      insuranceImage, 
      otherDocument,
      otherDocumentImage,
      rcImage, // Store the image paths in the database,
    };

    const newVehicle = await vehicleModel.create(data);
    user.vehicles.push(newVehicle._id);
    await user.save();

    return res.status(201).json({ success: "vehicle added", newVehicle });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getProfile = async (req, res) => {
  try {
    const _id = req.userId;

    const user = await userModel
      .findById(_id)
      .populate("vehicles")
      .select("-createdAt -verificationCode -otpExpires -isVerified");
    if (!user) return res.status(404).json({ error: "user not found" });

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getVehicles = async (req, res) => {
  try {
    const _id = req.userId;

    const user = await userModel.findById(_id).populate("vehicles");
    if (!user) return res.status(404).json({ error: "user not found" });

    return res.status(200).json({ vehicles: user.vehicles });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deleteVehicle = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = req.userId;

    const vehicle = await vehicleModel.findById(id);

    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    const user = await userModel.findById(_id);

    //check if vehicle belongs to user
    if (!user.vehicles.includes(id))
      return res.status(404).json({ error: "vehicle not found" });

    fs.unlink(vehicle.rcImage, function (err) {
      if (err) console.log(err);
    });

    await vehicleModel.findByIdAndDelete(id);
    user.vehicles = user.vehicles.filter((vehicle) => vehicle._id != id);

    await user.save();

    return res.status(200).json({ success: "vehicle deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getVehicle = async (req, res) => {
  try {
    const id = req.query.id;

    const vehicle = await vehicleModel.findById(id).populate("vehicleOwner");
    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    return res.status(200).json({ vehicle });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
