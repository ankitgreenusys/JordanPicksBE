const Express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/user.middleware");

const router = Express.Router();

router.post("/signin", userController.createUser);
// router.post("/verify", userController.verifyOTP);
// router.get("/resendotp/:id", userController.resendOtp);
router.post("/refreshtoken", userController.refreshAccessToken);
router.get("/getBonus", auth, userController.getBonus);
router.post("/login", userController.login);
router.get("/allPackage", userController.allActivePackages);
router.get("/getPackage/:id", auth, userController.getPackage);
router.get("/getVslPackage/:id", auth, userController.getVslPackage);
router.post("/contact", auth, userController.contactUs);
router.get("/getProfile", auth, userController.userDashboard);
router.patch("/updateProfile", auth, userController.updateProfile);
router.post("/createIntentPackage", auth, userController.buyPackage);
router.post("/validatePaymentPackage", auth, userController.validPaymentPackage);
router.post("/createIntentVslPackage", auth, userController.buyVslPackage);
router.post("/validatePaymentVslPackage", auth, userController.validPaymentVslPackage);
router.post("/walletWithdrawPackage", auth, userController.walletWithdrawPackage);
router.post("/walletWithdrawVslPackage", auth, userController.walletWithdrawVslPackage);
module.exports = router;
