const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER RECEIVED:", authHeader); // 🔍 DEBUG

  if (!authHeader)
    return res.status(401).json({ msg: "No token provided" });

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token)
    return res.status(401).json({ msg: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
