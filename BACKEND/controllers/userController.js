const User = require("../models/User");

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
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};
