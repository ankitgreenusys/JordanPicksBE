const credUser = require("./User/cred.controller");
const cartUser = require("./User/cart.controller");
const dashboardUser = require("./User/dashboard.controller");
const packageUser = require("./User/package.controller");
const publicUser = require("./User/public.controller");
const specialPackageUser = require("./User/specialPackage.controller");
const storeUser = require("./User/store.controller");
const vslPackageUser = require("./User/vslPackage.controller");

const routes = {
  ...credUser,
  ...cartUser,
  ...dashboardUser,
  ...packageUser,
  ...publicUser,
  ...specialPackageUser,
  ...storeUser,
  ...vslPackageUser,
};

module.exports = routes;
