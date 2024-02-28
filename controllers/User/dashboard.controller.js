const userModel = require("../../models/user.model");
const orderHistoryModel = require("../../models/orderHistory.model");

const routes = {};

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

module.exports = routes;
