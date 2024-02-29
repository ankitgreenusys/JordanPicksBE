const accountUser = require("./User/account.controller");
const cartUser = require("./User/cart.controller");
const packageUser = require("./User/package.controller");
const publicUser = require("./User/public.controller");
const specialPackageUser = require("./User/specialPackage.controller");
const storeUser = require("./User/store.controller");
const vslPackageUser = require("./User/vslPackage.controller");

const routes = {
  ...accountUser,
  ...cartUser,
  ...packageUser,
  ...publicUser,
  ...specialPackageUser,
  ...storeUser,
  ...vslPackageUser,
};

module.exports = routes;
