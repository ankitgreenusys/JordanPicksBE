const userModel = require("../../models/user.model");
const orderHistoryModel = require("../../models/orderHistory.model");
const specialPackageModel = require("../../models/specialPackage.model");

const sendPayment = require("../../utils/sendPayment.utils");

const routes = {};

routes.allSpecialPackages = async (req, res) => {
  try {
    const packages = await specialPackageModel
      .find({ isDeleted: false })
      .select("-links");

    return res.status(201).json({ msg: "success", dta: packages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.getSpecialPackage = async (req, res) => {
  try {
    const uid = req.userId;
    const id = req.params.id;
    const package = await specialPackageModel.findById(id);
    const user = await userModel.findById(uid).populate("specialPackage");

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (!package.pageCount) package.pageCount = 0;

    package.pageCount = package.pageCount + 1;

    await package.save();

    const isBuied = user.specialPackage.find((item) => {
      // console.log(item._id);
      return item._id == id;
    });

    let isBought = false;

    if (isBuied) isBought = true;
    else package.links = [];

    // console.log(isBuied);

    return res.status(200).json({ msg: "success", dta: package, isBought });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.buySpecialPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { packageId } = req.body;
  const id = req.userId;
  try {
    // const { error } = userValid.buySpecialPackageValidation.validate(req.body);

    // if (error) {
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    const user = await userModel.findById(id);
    const package = await specialPackageModel.findById(packageId);

    // console.log(package);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    if (user.specialPackage.includes(packageId)) {
      return res.status(400).json({ error: "package already purchased" });
    }

    const amount = package.price;

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

    // console.log(paymentIntent);

    return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.validPaymentSpecialPackage = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { paymentIntentId, packageId } = req.body;
  const { id } = req.query;

  // const { error } = userValid.validPaymentSpecialPackageValidation.validate(
  //   req.body
  // );

  // if (error) {
  //   return res.status(400).json({ error: error.details[0].message });
  // }

  // console.log(req.body, id);
  // console.log(paymentIntentId);
  try {
    const package = await specialPackageModel.findById(packageId);
    const user = await userModel.findById(id);
    // console.log(package, user);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    if (user.specialPackage.includes(packageId)) {
      return res.status(400).json({ error: "Package already purchased" });
    }
    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // console.log(paymentIntent);

    const cardDeduction = package.price;

    if (paymentIntent.status === "succeeded") {
      const order = await orderHistoryModel.create({
        user: id,
        specialPackage: packageId,
        status: "active",
        desc: `Package - ${package.name} purchased (card)`,
        price: cardDeduction,
        type: "Debit",
        method: "Card",
      });

      if (user.referredBy) {
        const refUser = await userModel.findById(user.referredBy);
        if (refUser) {
          const val = +(0.25 * cardDeduction).toFixed(2);
          refUser.wallet += val;
          const refOrder = await orderHistoryModel.create({
            user: refUser._id,
            status: "active",
            desc: `Referral Bonus`,
            price: val,
            type: "Credit",
            method: "Wallet",
          });
          refUser.orderHistory.push(refOrder._id);
          await refUser.save();
        }
      }

      user.specialPackage.push(package._id);
      user.orderHistory.push(order._id);

      await user.save();
      sendPayment(
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

module.exports = routes;
