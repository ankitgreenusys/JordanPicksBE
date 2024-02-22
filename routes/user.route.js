const Express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/user.middleware");

const router = Express.Router();

router.post("/signup", userController.createUser);
// router.post("/verify", userController.verifyOTP);
// router.get("/resendotp/:id", userController.resendOtp);
router.post("/refreshtoken", userController.refreshAccessToken);
router.get("/getBonus", auth, userController.getBonus);
router.post("/login", userController.login);
router.post("/generateOTP", userController.generateOTP);
router.post("/verifyAccount", userController.verifyAccount);
router.post("/resetPassOTP", userController.resetPassOTP);
router.post("/resetPass", userController.resetpassword);
router.get("/allPackage", userController.allActivePackages);
router.get("/allSpecialPackages", userController.allSpecialPackages);
router.get("/allStore", auth, userController.allStores);
router.get("/getstore/:id", auth, userController.storesById);
router.get("/getPackage/:id", auth, userController.getPackage);
router.get("/getVslPackage/:id", auth, userController.getVslPackage);
router.post("/contact", userController.contactUs);
router.get("/getProfile", auth, userController.userDashboard);
router.get("/getProfileShort", auth, userController.getWallet);
router.get("/getMyPackages", auth, userController.getMyPackages);
router.get("/getTransactions", auth, userController.getTransactions);
router.patch("/updateProfile", auth, userController.updateProfile);
router.post("/createIntentPackage", auth, userController.buyPackage);
router.post("/validatePaymentPackage", userController.validPaymentPackage);
router.post("/createIntentVslPackage", auth, userController.buyVslPackage);
router.post(
  "/validatePaymentVslPackage",
  auth,
  userController.validPaymentVslPackage
);
router.post(
  "/walletWithdrawPackage",
  auth,
  userController.walletWithdrawPackage
);
router.post(
  "/walletWithdrawVslPackage",
  auth,
  userController.walletWithdrawVslPackage
);
router.post("/createIntentStore", auth, userController.buyStore);
router.post("/validatePaymentStore", userController.validPaymentStore);

module.exports = router;
