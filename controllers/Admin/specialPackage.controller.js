const specialPackageModel = require("../../models/specialPackage.model");
const recurringOrderModel = require("../../models/RecurringOrder.model");

const routes = {};

routes.allSpecialPackages = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await specialPackageModel.find({ isDeleted: false });

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

routes.specialPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await specialPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    return res.status(201).json({ msg: "success", dta: package });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.addSpecialPackage = async (req, res) => {
  const {
    name,
    monthlyPrice,
    yearlyPrice,
    price,
    links,
    description,
    gamePreview,
    discount,
    videoURL,
  } = req.body;

  console.log(process.env.STRIPE_SECRET_KEY);
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    const newPackage = new specialPackageModel({
      name,
      monthlyPrice: monthlyPrice.toFixed(2) || 0,
      yearlyPrice: yearlyPrice.toFixed(2) || 0,
      description,
      price,
      gamePreview,
      links,
      discount,
      videoURL,
    });

    await newPackage.save();

    const product = await stripe.products.create({
      name: newPackage.name,
      metadata: {
        packageId: newPackage._id,
      },
      active: true,
    });

    const monthlyPriceStripe = await stripe.prices.create({
      product: product.id,
      unit_amount: newPackage.monthlyPrice * 100,
      currency: "usd",
      recurring: { interval: "monthly" },
      metadata: {
        packageId: newPackage._id,
      },
    });

    const yearlyPriceStripe = await stripe.prices.create({
      product: product.id,
      unit_amount: newPackage.yearlyPrice * 100,
      currency: "usd",
      recurring: { interval: "year" },
      metadata: {
        packageId: newPackage._id,
      },
    });

    newPackage.stripeProductId = product.id;
    newPackage.stripeMonthlyPriceId = monthlyPriceStripe.id;
    newPackage.stripeYearlyPriceId = yearlyPriceStripe.id;
    await newPackage.save();

    return res.status(201).json({ msg: "success", dta: newPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.updateSpecialPackage = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    monthlyPrice,
    yearlyPrice,
    price,
    links,
    description,
    gamePreview,
    discount,
    videoURL,
  } = req.body;

  // const { error } = adminValid.updateSpecialPackageValidation.validate(
  //   req.body
  // );

  // if (error) {
  //   return res.status(400).json({ error: error.details[0].message });
  // }

  try {
    const package = await specialPackageModel.findById(id);
    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    const updatedPackage = await specialPackageModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        monthlyPrice: monthlyPrice.toFixed(2) || 0,
        yearlyPrice: yearlyPrice.toFixed(2) || 0,
        description,
        gamePreview,
        price,
        links,
        videoURL,
        discount,
      },
      { new: true }
    );

    return res.status(201).json({ msg: "success", dta: updatedPackage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deleteSpecialPackage = async (req, res) => {
  const { id } = req.params;

  try {
    const package = await specialPackageModel.findOne({ _id: id });

    if (!package) {
      return res.status(404).json({ error: "package not found" });
    }

    const recurringOrders = await recurringOrderModel.find({
      specialPackage: id,
    });

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    recurringOrders.forEach(async (order) => {
      await stripe.subscriptions.cancel(order.stripeSubscriptionId);

      order.status = "inactive";
      await order.save();
    });

    await specialPackageModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    return res.status(201).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

routes.deletedSpecialPackage = async (req, res) => {
  const { page } = req.query;

  try {
    const packages = await specialPackageModel.find({ isDeleted: true });

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
