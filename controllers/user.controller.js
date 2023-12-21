const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const userModel = require("../models/user.model");
const vslPackageModel = require("../models/vslPackage.model");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const { emailValidation } = require("../validations/joi");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, username } = req.body;

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      mobile,
      password: hashedPassword,
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

routes.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // const { error } = emailValidation.validate(req.body);

    // if (error) {
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "invalid password" });
    }

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

    return res.status(201).json({ msg: "success", dta: newuser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.refreshAccessToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken)
    return res.status(401).send({ error: "Access denied, token missing!" });

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

    return res.status(201).send({
      msg: "success",
      dta: accessToken,
    });

    // return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.status(401).send({ error: "Invalid refresh token" });
    // return res.send(error(401, "Invalid refresh token"));
  }
};

routes.allActivePackages = async (req, res) => {
  try {
    const packages = await packageModel.find({ status: "active" });
    return res.status(201).json({ msg: "success", dta: packages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.contactUs = async (req, res) => {
  try {
    const { fName, lName, email, mobile, message } = req.body;

    const newContact = await contactModel.create({
      fName,
      lName,
      email,
      mobile,
      message,
    });

    return res.status(200).json({ msg: "success", dta: newContact });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.userDashboard = async (req, res) => {
  try {
    const id = req.userId;

    console.log(id);

    const user = await userModel
      .findById(id)
      .populate("package")
      .populate("vslPackage")
      .populate("orderHistory");

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    // Total Wins and Losses

    const totalWins = user.package.filter((item) => item.result === "win");
    const totalLosses = user.package.filter((item) => item.result === "lose");
    const totalTies = user.package.filter((item) => item.result === "tie");

    return res.status(200).json({
      msg: "success",
      dta: {
        user,
        totalWins: totalWins.length,
        totalLosses: totalLosses.length,
        totalTies: totalTies.length,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getPackage = async (req, res) => {
  try {
    const id = req.userId;
    const package = await packageModel.findById(id);
    return res.status(200).json({ msg: "success", dta: package });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.buyPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  console.log(paymentIntent);
  return res.status(201).json({ msg: "success", dta: paymentIntent });
};

module.exports = routes;
