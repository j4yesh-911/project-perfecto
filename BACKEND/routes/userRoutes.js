const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  completeProfile,
  getAllUsers,
  getPotentialMatches,
  updateProfile,
  getUserById,
} = require("../controllers/userController");

router.get("/", authMiddleware, getAllUsers);        // ✅ NEW
router.get("/potential-matches", authMiddleware, getPotentialMatches); // ✅ NEW
router.get("/:id", authMiddleware, getUserById);     // ✅ NEW
router.post("/complete-profile", authMiddleware, completeProfile);
router.put("/update-profile", authMiddleware, updateProfile);

module.exports = router;
