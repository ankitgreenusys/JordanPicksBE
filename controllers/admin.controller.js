const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const userModel = require("../models/user.model");
const vslPackageModel = require("../models/vslPackage.model");

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
  try {
    const users = await userModel.find();
    return res.status(201).json({ msg: "success", dta: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find();
    return res.status(201).json({ msg: "success", dta: contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allPackages = async (req, res) => {
  try {
    const packages = await packageModel.find().populate("bets");
    return res.status(201).json({ msg: "success", dta: packages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allVslPackages = async (req, res) => {
  try {
    const packages = await vslPackageModel.find().populate("bets");
    return res.status(201).json({ msg: "success", dta: packages });
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
    const { name, price, bets, date, description, gamePreview, endDate } =
      req.body;

    const newPackage = await packageModel.create({
      name,
      price,
      bets,
      date,
      endDate,
      description,
      gamePreview,
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
      price,
      bets,
      date,
      description,
      gamePreview,
      startDate,
      endDate,
      saleTitle,
    } = req.body;

    const newPackage = await vslPackageModel.create({
      name,
      price,
      bets,
      date,
      description,
      gamePreview,
      startDate,
      endDate,
      saleTitle,
    });

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackageStatus = async (req, res) => {
  const { id } = req.params;
  const { status, runningStatus } = req.body;

  try {
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

routes.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { name, price, bets, date, description, gamePreview, endDate } =
    req.body;

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
        bets,
        date,
        endDate,
        description,
        gamePreview,
      },
      { new: true }
    );

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
    price,
    bets,
    date,
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
        price,
        bets,
        date,
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
