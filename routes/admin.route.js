const express = require("express");
const controller = require("../controllers/admin.controller");
const auth = require("../middlewares/admin.middleware");

const router = express.Router();

router.post("/signup", controller.createUser);
router.post("/login", controller.login);
router.get("/allUsers", auth, controller.allUsers);
router.get("/allPackages", auth, controller.allPackages);
router.get("/allVslPackages", auth, controller.allVslPackages); 
router.get("/contactedusers", auth, controller.allContacts);
router.get("/allOrders", auth, controller.allOrders);
router.get("/overview", auth, controller.overview);
router.post("/createPackage", auth, controller.addPackage);
router.post("/createVslPackage", auth, controller.addVslPackage);
router.patch("/updatePackageStatus/:id", auth, controller.updatePackageStatus);
router.patch("/updateVslPackageStatus/:id", auth, controller.updateVslPackageStatus);
router.put("/updatePackage/:id", auth, controller.updatePackage);
router.put("/updateVslPackage/:id", auth, controller.updateVslPackage);
router.delete("/deletePackage/:id", auth, controller.deletePackage);
router.delete("/deleteVslPackage/:id", auth, controller.deleteVslPackage);

module.exports = router;
