const orderHistoryModel = require("../../models/orderHistory.model");
const packageModel = require("../../models/package.model");
const userModel = require("../../models/user.model");

const adminValid = require("../../validations/admin.joi");

const routes = {};

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

    return res.status(200).json({
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

routes.updatePackageStatus = async (req, res) => {
  const { id } = req.params;
  let { status, result } = req.body;

  const { error } = adminValid.updatePackageStatusValidation.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // console.log(id, status, result);
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

    if (result === "tie" || result === "lose") {
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
          type: "Credit",
          method: "Wallet",
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
    category,
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
        category,
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

    // console.log(package);

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

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
};

module.exports = routes;
