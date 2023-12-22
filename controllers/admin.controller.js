const sendOTP = require("../utils/sendOtp.utils");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const vslPackageModel = require("../models/vslPackage.model");
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

    const limit = 10;
    const totalPages = Math.ceil(users.length / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = users.slice(startIndex, endIndex);

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

routes.allContacts = async (req, res) => {
  const { page } = req.query;

  try {
    const contacts = await contactModel.find();

    const limit = 10;
    const totalPages = Math.ceil(contacts.length / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = contacts.slice(startIndex, endIndex);

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

routes.allPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await packageModel.find({ result: "pending" });

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

routes.pastPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await packageModel.find({ result: { $ne: "pending" } });

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

  // try {
  //   const packages = await packageModel.find({ result: { $ne: "pending" } });
  //   return res.status(201).json({ msg: "success", dta: packages });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({ error: "internal server error" });
  // }
};

routes.packageById = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await packageModel.findOne({ _id: id });

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
    const packages = await vslPackageModel.find();

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

routes.vslPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

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
  const { page } = req.query;
  try {
    const orders = await orderHistoryModel
      .find()
      .populate("user")
      .populate("package")
      .populate("vslPackage");

    const limit = 10;
    const totalPages = Math.ceil(orders.length / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = orders.slice(startIndex, endIndex);

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
      bets,
    });

    // bets.forEach(async (bet) => {
    //   const newBet = await betModel.create({
    //     title: bet,
    //   });
    //   await packageModel.findOneAndUpdate(
    //     { _id: newPackage._id },
    //     { $push: { bets: newBet._id } },
    //     { new: true }
    //   );
    // });

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
      bets,
    });

    // bets.forEach(async (bet) => {
    //   const newBet = await betModel.create({
    //     title: bet,
    //   });

    //   await vslPackageModel.findOneAndUpdate(
    //     { _id: newPackage._id },
    //     { $push: { bets: newBet._id } },
    //     { new: true }
    //   );
    // });

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackageStatus = async (req, res) => {
  const { id } = req.params;
  let { status, result } = req.body;

  try {
    console.log(id, status, result);
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ msg: "package not found" });
    }

    if (!status) {
      status = package.status;
    }

    if (!result) {
      result = package.result;
    }

    if (result === "lose") {
      //credit price to all users wallet who bought
      const orders = await orderHistoryModel
        .find({ package: id })
        .populate("user")
        .populate("package");

      orders.forEach(async (order) => {
        await userModel.findOneAndUpdate(
          { _id: order.user },
          { $inc: { wallet: order.package.price } },
          { new: true }
        );
      });
    }

    if (result !== "pending")
       status = "inactive";

    const updatedPackage = await packageModel.findOneAndUpdate(
      { _id: id },
      { status, result },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

// routes.updatePackageBetStatus = async (req, res) => {
//   const { id } = req.params;
//   const { betId, status } = req.body;

//   console.log(id, betId, status);

//   try {
//     const package = await packageModel.findById(id);

//     if (!package) {
//       return res.status(404).json({ msg: "package not found" });
//     }

//     // id exists in package.bets

//     const exits = package.bets.some((item) => item._id == betId);

//     if (!exits) {
//       return res.status(404).json({ msg: "bet not found" });
//     }

//     const updatedBet = await betModel.findOneAndUpdate(
//       { _id: betId },
//       { result: status },
//       { new: true }
//     );

//     return res.status(201).json({ msg: "success" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "internal server error" });
//   }
// };

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

// routes.updateVslPackageBetStatus = async (req, res) => {
//   const { id } = req.params;
//   const { betId, status } = req.body;

//   console.log(id, betId, status);

//   try {
//     const package = await vslPackageModel.findOne({ _id: id });

//     if (!package) {
//       return res.status(404).json({ msg: "package not found" });
//     }

//     // id exists in package.bets

//     const exits = package.bets.some((item) => item._id == betId);

//     if (!exits) {
//       return res.status(404).json({ msg: "bet not found" });
//     }

//     const updatedBet = await betModel.findOneAndUpdate(
//       { _id: betId },
//       { result: status },
//       { new: true }
//     );

//     return res.status(201).json({ msg: "success" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "internal server error" });
//   }
// };

routes.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { name, price, bets, description, gamePreview, endDate } = req.body;
  // const newBets = JSON.parse(bets);/

  try {
    const package = await packageModel.findById(id);
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
        bets,
      },
      { new: true }
    );

    // console.log(newBets,"newBets");

    // bets.forEach(async (bet) => {
    //   if (bet.action === "add") {
    //     const newBet = await betModel.create({
    //       title: bet.title,
    //     });
    //     await packageModel.findOneAndUpdate(
    //       { _id: updatedPackage._id },
    //       { $push: { bets: newBet._id } },
    //       { new: true }
    //     );
    //   } else if (bet.action === "update") {
    //     await betModel.findOneAndUpdate(
    //       { _id: bet._id },
    //       { title: bet.title },
    //       { new: true }
    //     );
    //   } else if (bet.action === "delete") {
    //     await betModel.findOneAndDelete({ _id: bet._id });
    //     await packageModel.findOneAndUpdate(
    //       { _id: updatedPackage._id },
    //       { $pull: { bets: bet._id } },
    //       { new: true }
    //     );
    //   }
    // });

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
