const Express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/user.middleware");

const router = Express.Router();

router.post("/signin", userController.createUser);
// router.post("/verify", userController.verifyOTP);
// router.get("/resendotp/:id", userController.resendOtp);
router.post("/refreshtoken", userController.refreshAccessTokenController);

module.exports = router;
