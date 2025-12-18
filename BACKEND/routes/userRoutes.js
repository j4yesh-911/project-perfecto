// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/authMiddleware");
// const { completeProfile } = require("../controllers/userController");

// console.log("✅ userRoutes loaded");

// router.post("/complete-profile", authMiddleware, completeProfile);

// module.exports = router;


const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  completeProfile,
  getAllUsers,
} = require("../controllers/userController");

router.get("/", authMiddleware, getAllUsers);        // ✅ NEW
router.post("/complete-profile", authMiddleware, completeProfile);

module.exports = router;
