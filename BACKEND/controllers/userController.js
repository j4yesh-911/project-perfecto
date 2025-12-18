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

    res.status(200).json({
      msg: "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

// ================= GET ALL USERS =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isProfileComplete: true })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

// ================= GET POTENTIAL MATCHES =================
exports.getPotentialMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get users already liked/disliked
    const likedUserIds = await Like.find({ fromUser: userId }).distinct("toUser");

    // Find potential matches: users with complementary skills
    const potentialUsers = await User.find({
      _id: { $ne: userId, $nin: likedUserIds },
      isProfileComplete: true,
      $or: [
        // Users who teach what I want to learn
        { skillsToTeach: { $in: currentUser.skillsToLearn || [] } },
        // Users who learn what I teach
        { skillsToLearn: { $in: currentUser.skillsToTeach || [] } },
      ],
    }).select("-password");

    res.status(200).json(potentialUsers);
  } catch (error) {
    console.error(error);    res.status(500).json({ msg: "Failed to fetch users" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};
exports.updateProfile = async (req, res) => {
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
      },
      { new: true }
    );

    res.status(200).json({
      msg: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Profile update failed" });
  }
};
