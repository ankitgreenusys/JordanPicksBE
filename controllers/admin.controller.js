const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const vslPackageModel = require("../models/vslPackage.model");
const betModel = require("../models/bet.model");
const userModel = require("../models/user.model");

const {
  createAdminValidation,
  loginValidation,
} = require("../validations/joi");

const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const { error } = createAdminValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await adminModel.findOne({ email });

    if (user) {
      return res.status(404).json({ error: "email already exists" });
    }

    const newUser = await adminModel.create({ email, name, password });

    return res.status(201).json({ msg: "success", dta: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = loginValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await adminModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "email not found" });
    }

    if (user.password !== password) {
      return res.status(404).json({ error: "password incorrect" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({ msg: "success", dta: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allUsers = async (req, res) => {
  //apply pagination
  const { page } = req.query;

  try {
    const users = await userModel.find();

    const totalPages = users.length;
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = users.slice(startIndex, endIndex);

    return res.status(201).json({
      msg: "success",
      totalPage,
      dta: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allContacts = async (req, res) => {
  const { page } = req.query;

  try {
    const contacts = await contactModel.find();

    const totalPages = contacts.length;
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = contacts.slice(startIndex, endIndex);

    return res.status(201).json({
      msg: "success",
      totalPage,
      dta: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await packageModel.find().populate("bets");

    const totalPages = packages.length;
    const limit = 10;

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

routes.packageById = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await packageModel.findOne({ _id: id }).populate("bets");

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    return res.status(201).json({ msg: "success", dta: package });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allVslPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await vslPackageModel.find().populate("bets");

    const totalPages = packages.length;
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = packages.slice(startIndex, endIndex);

    return res.status(201).json({
      msg: "success",
      totalPage,
      dta: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.vslPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await vslPackageModel.findOne({ _id: id }).populate("bets");

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    return res.status(201).json({ msg: "success", dta: package });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allOrders = async (req, res) => {
  try {
    const orders = await orderHistoryModel
      .find()
      .populate("user")
      .populate("package")
      .populate("vslPackage");
    return res.status(201).json({ msg: "success", dta: orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.overview = async (req, res) => {
  try {
    const users = await userModel.find({ isVerified: true });
    const contacts = await contactModel.find();
    const packages = await packageModel.find();
    const vslPackages = await vslPackageModel.find();
    const orders = await orderHistoryModel.find();

    return res.status(201).json({
      msg: "success",
      dta: {
        users: users.length,
        contacts: contacts.length,
        packages: packages.length,
        vslPackages: vslPackages.length,
        orders: orders.length,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.addPackage = async (req, res) => {
  try {
    const { name, price, bets, description, gamePreview, endDate } = req.body;

    const newPackage = await packageModel.create({
      name,
      price,
      endDate,
      description,
      gamePreview,
    });

    bets.forEach(async (bet) => {
      const newBet = await betModel.create({
        title: bet,
      });
      await packageModel.findOneAndUpdate(
        { _id: newPackage._id },
        { $push: { bets: newBet._id } },
        { new: true }
      );
    });

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.addVslPackage = async (req, res) => {
  try {
    const {
      name,
      actPrice,
      discountedPrice,
      bets,
      description,
      gamePreview,
      startDate,
      endDate,
      saleTitle,
    } = req.body;

    const newPackage = await vslPackageModel.create({
      name,
      actPrice,
      discountedPrice,
      description,
      gamePreview,
      startDate,
      endDate,
      saleTitle,
    });

    bets.forEach(async (bet) => {
      const newBet = await betModel.create({
        ...bet,
      });

      await vslPackageModel.findOneAndUpdate(
        { _id: newPackage._id },
        { $push: { bets: newBet._id } },
        { new: true }
      );
    });

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackageStatus = async (req, res) => {
  const { id } = req.params;
  let { status, runningStatus } = req.body;

  try {
    console.log(id, status, runningStatus);
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    if (!status) {
      status = package.status;
    }

    if (!runningStatus) {
      runningStatus = package.runningStatus;
    }

    const updatedPackage = await packageModel.findOneAndUpdate(
      { _id: id },
      { status, runningStatus },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackageBetStatus = async (req, res) => {
  const { id } = req.params;
  const { betId, status } = req.body;

  try {
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    // id exists in package.bets

    const exits = package.bets.some((item) => item._id === betId);

    if (!exits) {
      return res.status(404).json({ msg: "bet not found" });
    }

    const updatedBet = await betModel.findOneAndUpdate(
      { _id: betId },
      { status },
      { new: true }
    );

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateVslPackageStatus = async (req, res) => {
  const { id } = req.params;
  const { status, runningStatus } = req.body;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    if (!status) {
      status = package.status;
    }

    if (!runningStatus) {
      runningStatus = package.runningStatus;
    }

    const updatedPackage = await vslPackageModel.findOneAndUpdate(
      { _id: id },
      { status, runningStatus },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateVslPackageBetStatus = async (req, res) => {
  const { id } = req.params;
  const { betId, status } = req.body;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    // id exists in package.bets

    const exits = package.bets.some((item) => item._id === betId);

    if (!exits) {
      return res.status(404).json({ msg: "bet not found" });
    }

    const updatedBet = await betModel.findOneAndUpdate(
      { _id: betId },
      { status },
      { new: true }
    );

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { name, price, bets, description, gamePreview, endDate } = req.body;
  const newBets = JSON.parse(bets);

  console.log(newBets);

  try {
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    const updatedPackage = await packageModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        price,
        endDate,
        description,
        gamePreview,
      },
      { new: true }
    );

    const oldBets = updatedPackage.bets;
    const newBets = bets.filter((item) => !oldBets.includes(item?._id));
    const updateBets = bets.filter((item) => oldBets.includes(item?._id));
    // const deletedBets = oldBets.filter((item) => !bets.includes(item));
    const deletedBets = oldBets.filter(
      (item) => !bets.some((bet) => bet._id === item)
    );
    const updatedBets = [];
    console.log(oldBets, newBets, updateBets, deletedBets);

    updatedPackage.bets = [];
    await updatedPackage.save();

    // deletedBets.forEach(async (bet) => {
    //   await betModel.findOneAndDelete({ _id: bet });
    // });

    newBets.forEach(async (bet) => {
      const newBet = await betModel.create({
        title: bet.title,
      });

      console.log(newBet._id);

      // updatedPackage.bets.push(newBet._id);
      updatedBets.push(newBet._id);
    });
    packageModel.findOneAndUpdate(
      { _id: id },
      { $push: { bets: updatedBets } },
      { new: true }
    );

    // updateBets.forEach(async (bet) => {
    //   const updatedBet = await betModel.findOneAndUpdate(
    //     { _id: bet },
    //     { title: bet.title, result: bet.result },
    //     { new: true }
    //   );

    //   updatedBets.push(updatedBet._id);
    // });

    // console.log(updatedBets);

    // await packageModel.findOneAndUpdate(
    //   { _id: id },
    //   { bets: updatedBets },
    //   { new: true }
    // );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateVslPackage = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    actPrice,
    discountedPrice,
    bets,
    description,
    gamePreview,
    startDate,
    endDate,
    saleTitle,
  } = req.body;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    const updatedPackage = await vslPackageModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        actPrice,
        discountedPrice,
        bets,
        description,
        gamePreview,
        startDate,
        endDate,
        saleTitle,
      },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deletePackage = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    await packageModel.findOneAndDelete({ _id: id });

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deleteVslPackage = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    await vslPackageModel.findOneAndDelete({ _id: id });

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
// export default routes;
