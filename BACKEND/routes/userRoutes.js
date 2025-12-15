const express = require("express");
const auth = require("../middleware/authMiddleware");
const { updateSkills, getMatches } = require("../controllers/userController");

const router = express.Router();

router.put("/skills", auth, updateSkills);
router.get("/matches", auth, getMatches);

module.exports = router;
