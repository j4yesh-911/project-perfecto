const User = require("../models/User");
const Like = require("../models/Like");

// ================= COMPLETE PROFILE =================
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      username,
      age,
      gender,
      phone,
      address,
      skillsToTeach,
      skillsToLearn,
      profilePic,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        age,
        gender,
        phone,
        address,
        skillsToTeach,
        skillsToLearn,
        profilePic,
        isProfileComplete: true,
      },
      { new: true }
    );

    res.status(200).json({ msg: "Profile completed", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

// ================= GET ALL USERS =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
      isProfileComplete: true,
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

// ================= GET POTENTIAL MATCHES =================
exports.getPotentialMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const likedUserIds = await Like.find({
      fromUser: req.user.id,
    }).distinct("toUser");

    const users = await User.find({
      _id: { $ne: req.user.id, $nin: likedUserIds },
      isProfileComplete: true,
      $or: [
        { skillsToTeach: { $in: currentUser.skillsToLearn || [] } },
        { skillsToLearn: { $in: currentUser.skillsToTeach || [] } },
      ],
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch potential matches" });
  }
};

// ================= GET USER BY ID =================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ msg: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

// ================= MATCH USERS (FINAL & WORKING) =================
exports.matchUsers = async (req, res) => {
  let { learnSkill, teachSkill } = req.body;

  learnSkill = learnSkill.trim();
  teachSkill = teachSkill.trim();

  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
      isProfileComplete: true,

      // THEY teach what I want to learn
      skillsToTeach: {
        $regex: new RegExp(`^${learnSkill}$`, "i"),
      },

      // THEY want to learn what I can teach
      skillsToLearn: {
        $regex: new RegExp(`^${teachSkill}$`, "i"),
      },
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({ msg: "Match failed" });
  }
};
