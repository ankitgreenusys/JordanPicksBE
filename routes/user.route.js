const Express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/user.middleware");

const router = Express.Router();

router.post("/signin", userController.createUser);
// router.post("/verify", userController.verifyOTP);
// router.get("/resendotp/:id", userController.resendOtp);
router.post("/refreshtoken", userController.refreshAccessToken);
router.post("/login", userController.login);
router.get("/allPackage", userController.allActivePackages);
router.get("/getPackage", auth, userController.getPackage);
router.post("/contact", auth, userController.contactUs);
router.get("/getProfile", auth, userController.userDashboard);


module.exports = router;
