const Express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/user.middleware");
const multer = require("multer");

const router = Express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination directory where files will be stored
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    // Set the file name for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      req.userId +
        "-" +
        file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({ storage: storage });

router.post("/signin", userController.createUser);
router.post("/verify", userController.verifyOTP);
router.get("/resendotp/:id", userController.resendOtp);
router.post("/register", userController.regestration);
router.post("/refreshtoken", userController.refreshAccessTokenController);

router.post(
  "/addVehicle",
  auth,
  upload.single("rcImage"),

  userController.addVehicle
);

router.get("/getVehicles", auth, userController.getVehicles);
router.get("/profile", auth, userController.getProfile);
router.get("/getVehicle", auth, userController.getVehicle);
router.delete("/deleteVehicle/:id", auth, userController.deleteVehicle);

module.exports = router;
