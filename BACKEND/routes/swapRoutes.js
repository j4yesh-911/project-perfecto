const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  sendSwapRequest,
  getMyRequests,
  acceptRequest,
  declineRequest,
} = require("../controllers/swapController");

router.post("/send", auth, sendSwapRequest);
router.get("/requests", auth, getMyRequests);
router.post("/accept/:id", auth, acceptRequest);
router.post("/decline/:id", auth, declineRequest);

module.exports = router;




