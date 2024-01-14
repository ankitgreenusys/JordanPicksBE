const express = require("express");
const controller = require("../controllers/admin.controller");
const auth = require("../middlewares/admin.middleware");

const router = express.Router();

router.post("/signup", controller.createUser);
router.post("/login", controller.login);
router.get("/allUsers", auth, controller.allUsers);
router.post("/changeUserBalance/:userId", auth, controller.changeUserBalance);
router.get("/allPackages", auth, controller.allPackages);
router.get("/pastPackages", auth, controller.pastPackages);
router.get("/getPackage/:id", auth, controller.packageById);
router.get("/allVslPackages", auth, controller.allVslPackages);
router.get("/getVslPackage/:id", auth, controller.vslPackageById); 
router.get("/contactedusers", auth, controller.allContacts);
router.get("/allOrders", auth, controller.allOrders);
router.get("/overview", auth, controller.overview);
router.post("/createPackage", auth, controller.addPackage);
router.post("/createVslPackage", auth, controller.addVslPackage);
router.patch("/updatePackageStatus/:id", auth, controller.updatePackageStatus);
// router.patch("/updatePackageBetStatus/:id", auth, controller.updatePackageBetStatus);
router.patch("/updateVslPackageStatus/:id", auth, controller.updateVslPackageStatus);
// router.patch("/updateVslPackageBetStatus/:id", auth, controller.updateVslPackageBetStatus);
router.put("/updatePackage/:id", auth, controller.updatePackage);
router.put("/updateVslPackage/:id", auth, controller.updateVslPackage);
router.delete("/deletePackage/:id", auth, controller.deletePackage);
router.delete("/deleteVslPackage/:id", auth, controller.deleteVslPackage);
router.get("/deletedPackages", auth, controller.deletedPackages);
router.get("/deletedVslPackages", auth, controller.deletedVslPackages);
router.get("/bulkPackageMail", auth, controller.bulkPackageMail);
router.get("/bulkCustomMail", auth, controller.bulkCustomMail)
router.get("/getUser/:id", controller.getUserById);
router.patch("/updateUserStatus/:id", controller.updateUserStatus)
router.get("/directupdate", controller.directupdate)

module.exports = router;
