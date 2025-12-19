const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header missing" });
    }

    // 2️⃣ Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 THIS IS CRITICAL FOR CHAT APP
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    // 4️⃣ Attach user to request (ONLY ID — fast & clean)
    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
