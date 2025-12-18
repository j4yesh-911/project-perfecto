const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ msg: "Token error" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ msg: "Token malformatted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // VERY IMPORTANT FOR PROFILE FLOW
    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired" });
  }
};
