const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const admin = require("../models/admin.model");

const auth = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).send({ error: "Unauthorized" });

    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      const id = decodedData?.id;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "No user with that id" });

      console.log(id);

      const user = await admin.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      req.userId = id;
      next();
    } else {
      return res.status(401).send({ error: "Found Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = auth;
// export default auth;
