// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // token me { id: user._id } set kiya tha
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
