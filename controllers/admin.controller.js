const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const contactModel = require("../models/contact.model");
const orderHistoryModel = require("../models/orderHistory.model");
const packageModel = require("../models/package.model");
const vslPackageModel = require("../models/vslPackage.model");
const userModel = require("../models/user.model");
const storeModel = require("../models/store.model");

const sendAllPackage = require("../utils/sendAllPackageMsg.utils");
const sendCustomMsg = require("../utils/sendCustomMsg.utils");

const adminValid = require("../validations/admin.joi");
const routes = {};

routes.createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const { error } = adminValid.createAdminValidation.validate(req.body);

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

    const { error } = adminValid.loginValidation.validate(req.body);

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
  const { page, name, mobile, email } = req.query;

  try {
    const allusers = await userModel.find().sort({ createdAt: -1 });
    let users = [];

    if (name)
      users = allusers.filter((user) =>
        user.name.toLowerCase().includes(name.toLowerCase())
      );
    if (mobile)
      users = allusers.filter((user) =>
        user.mobile.toString().includes(mobile)
      );

    if (email)
      users = users.filter((user) =>
        user.email.toLowerCase().includes(email.toLowerCase())
      );

    if (!name && !mobile && !email) users = allusers;

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

routes.changeUserBalance = async (req, res) => {
  const { userId } = req.params;
  const { wallet } = req.body;

  const { error } = adminValid.changeUserBalanceValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { wallet: wallet },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.allContacts = async (req, res) => {
  const { page } = req.query;

  try {
    const contacts = await contactModel.find().sort({ createdAt: -1 });

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
    const packages = await packageModel.find({
      result: "pending",
      isDeleted: false,
    });

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

routes.allStores = async (req, res) => {
  const { page } = req.query;

  try {
    const store = await storeModel.find({
      isDeleted: false,
    });

    const limit = 10;
    const totalPages = Math.ceil(store.length / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = store.slice(startIndex, endIndex);

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

routes.storesById = async (req, res) => {
  const { id } = req.id;

  try {
    const store = await storeModel.findById(id);

    if (!store) {
      return res.status(404).json({ error: "store not found" });
    }

    return res.status(201).json({ msg: "success", dta: store });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.pastPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await packageModel
      .find({ result: { $ne: "pending" } })
      .sort({ createdAt: -1 });

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
      return res.status(404).json({ error: "package not found" });
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
      return res.status(404).json({ error: "package not found" });
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
    // reverse order
    const orders = await orderHistoryModel
      .find()
      .populate("user")
      .populate("package")
      .populate("vslPackage")
      .sort({ createdAt: -1 });

    // orders.reverse();

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
  const {
    name,
    price,
    bets,
    description,
    gamePreview,
    endDate,
    videoURL,
    sports,
    category,
  } = req.body;

  const { error } = adminValid.addPackageValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newPackage = await packageModel.create({
      name,
      price,
      endDate,
      description,
      gamePreview,
      bets,
      videoURL,
      sports,
      category,
    });

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.addStore = async (req, res) => {
  const { name, price, credits } = req.body;

  const { error } = adminValid.addStoreValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newStore = await storeModel.create({ name, price, credits });

    return res.status(201).json({ msg: "success", dta: newStore });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.addVslPackage = async (req, res) => {
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
    videoURL,
  } = req.body;

  const { error } = adminValid.addVslPackageValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
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
      videoURL,
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

  const { error } = adminValid.updatePackageStatusValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    console.log(id, status, result);
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
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

      const user = new Set([]);

      orders.forEach(async (order) => {
        user.add(order.user._id);
      });

      // set to array
      const uniqueuser = Array.from(user);

      // user.forEach(async (order) => {

      //   if (user.has(order.user._id)) {
      //     return;
      //   }
      //   await userModel.findOneAndUpdate(
      //     { _id: order.user },
      //     { $inc: { wallet: order.package.price } },
      //     { new: true }
      //   );

      //   const newOrder = await orderHistoryModel.create({
      //     user: order.user,
      //     package: order.package,
      //     status: "inactive",
      //     desc: "wallet credited",
      //     price: order.package.price,
      //   });

      //   await userModel.findOneAndUpdate(
      //     { _id: order.user },
      //     { $push: { orderHistory: newOrder._id } },
      //     { new: true }
      //   );

      //   user.add(order.user._id);
      // });

      uniqueuser.forEach(async (userId) => {
        await userModel.findOneAndUpdate(
          { _id: userId },
          { $inc: { wallet: orders[0].package.price } },
          { new: true }
        );

        const newOrder = await orderHistoryModel.create({
          user: userId,
          package: id,
          status: "inactive",
          desc: "Refund of " + orders[0].package.name + " package",
          price: orders[0].package.price,
        });

        await userModel.findOneAndUpdate(
          { _id: userId },
          { $push: { orderHistory: newOrder._id } },
          { new: true }
        );
      });
    }

    if (result !== "pending") status = "inactive";

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

routes.getPackagePageCount = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await packageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    return res.status(201).json({ msg: "success", dta: package.pageCount });
  } catch (error) {
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
  let { status, result } = req.body;

  const { error } = adminValid.updateVslPackageStatusValidation.validate(
    req.body
  );

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const package = await vslPackageModel.findOne({ _id: id });

  if (!package) {
    return res.status(404).json({ error: "package not found" });
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
      .find({ vslPackage: id })
      .populate("user")
      .populate("vslPackage");

    const user = new Set([]);

    orders.forEach(async (order) => {
      user.add(order.user._id);
    });

    // set to array
    const uniqueuser = Array.from(user);

    // user.forEach(async (order) => {

    //   if (user.has(order.user._id)) {
    //     return;
    //   }
    //   await userModel.findOneAndUpdate(
    //     { _id: order.user },
    //     { $inc: { wallet: order.package.price } },
    //     { new: true }
    //   );

    //   const newOrder = await orderHistoryModel.create({
    //     user: order.user,
    //     package: order.package,
    //     status: "inactive",
    //     desc: "wallet credited",
    //     price: order.package.price,
    //   });

    //   await userModel.findOneAndUpdate(
    //     { _id: order.user },
    //     { $push: { orderHistory: newOrder._id } },
    //     { new: true }
    //   );

    //   user.add(order.user._id);
    // });

    uniqueuser.forEach(async (userId) => {
      await userModel.findOneAndUpdate(
        { _id: userId },
        { $inc: { wallet: orders[0].vslPackage.discountedPrice } },
        { new: true }
      );

      const newOrder = await orderHistoryModel.create({
        user: userId,
        vslPackage: id,
        status: "inactive",
        desc: "Refund of " + orders[0].vslPackage.name + " package",
        price: orders[0].vslPackage.discountedPrice,
      });

      await userModel.findOneAndUpdate(
        { _id: userId },
        { $push: { orderHistory: newOrder._id } },
        { new: true }
      );
    });
  }

  if (result !== "pending") status = "inactive";

  const updatedPackage = await vslPackageModel.findOneAndUpdate(
    { _id: id },
    { status, result },
    { new: true }
  );

  return res.status(201).json({ msg: "success", dta: updatedPackage });
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

routes.getVslPackagePageCount = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    return res.status(201).json({ msg: "success", dta: package.pageCount });
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updatePackage = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    bets,
    description,
    gamePreview,
    endDate,
    videoURL,
    sports,
    category
  } = req.body;
  // const newBets = JSON.parse(bets);/

  const { error } = adminValid.updatePackageValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const package = await packageModel.findById(id);
    if (!package) {
      return res.status(404).json({ error: "package not found" });
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
        videoURL,
        sports,
        category
      },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateStore = async (req, res) => {
  const { id } = req.params;
  const { name, price, credits } = req.body;

  const { error } = adminValid.addStoreValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const store = await storeModel.findById(id);
    if (!store) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updateStore = await storeModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        price,
        credits,
      },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updateStore });
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
    videoURL,
  } = req.body;

  const { error } = adminValid.updateVslPackageValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const package = await vslPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
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
        videoURL,
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

    console.log(package);

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    // if (package.status === "active") {
    //   return res.status(404).json({ error: "package is active" });
    // }

    // if (package.result === "pending") {
    //   return res.status(404).json({ error: "package is pending" });
    // }

    await packageModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true, status: "inactive" },
      { new: true }
    );

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deleteStore = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await storeModel.findById(id);
    if (!store) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updateStore = await storeModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updateStore });
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
      return res.status(404).json({ error: "package not found" });
    }

    if (package.status === "active") {
      return res.status(404).json({ error: "package is active" });
    }

    if (package.result !== "pending") {
      return res.status(404).json({ error: "package is pending" });
    }

    await vslPackageModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true, status: "inactive" },
      { new: true }
    );

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deletedPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await packageModel.find({ isDeleted: true });

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
  //   const packages = await packageModel.find({ isDeleted: true });
  //   return res.status(201).json({ msg: "success", dta: packages });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({ error: "internal server error" });
  // }
};

routes.deletedVslPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await vslPackageModel.find({ isDeleted: true });

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
  //   const packages = await vslPackageModel.find({ isDeleted: true });
  //   return res.status(201).json({ msg: "success", dta: packages });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({ error: "internal server error" });
  // }
};

routes.bulkPackageMail = async (req, res) => {
  // const { title, data } = req.body;

  try {
    const users = await userModel.find({ isVerified: true, status: "active" });
    const allActivePackages = await packageModel.find({ status: "active" });

    const data = allActivePackages.filter((item) => {
      return new Date(item.endDate) > Date.now();
    });

    users.forEach(async (user) => {
      await sendAllPackage(
        user.email,
        user.name,
        "Jordanspicks.com packages out NOW!",
        data
      );
    });

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

routes.bulkCustomMail = async (req, res) => {
  const { data } = req.body;

  try {
    const users = await userModel.find({ isVerified: true, status: "active" });

    users.forEach(async (user) => {
      await sendCustomMsg(
        user.email,
        user.name,
        data,
        "Jordanspicks.com packages out NOW!"
      );
    });

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

routes.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.status(201).json({ msg: "success", dta: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  try {
    const user = await userModel.findOneAndUpdate(
      { _id: id },
      {
        status,
        remark,
      },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.directupdate = async (req, res) => {
  try {
    const allUsers = await userModel.find();
    // res.json(allUsers)

    allUsers.forEach(async (user) => {
      await userModel.findByIdAndUpdate(
        user._id,
        { username: user._id },
        { new: true }
      );
    });
    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = routes;
// export default routes;
