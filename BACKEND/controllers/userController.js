const User = require("../models/User");

exports.updateSkills = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true }
  );
  res.json(user);
};

exports.getMatches = async (req, res) => {
  const currentUser = await User.findById(req.user.id);

  const matches = await User.find({
    _id: { $ne: currentUser._id },
    skillsToTeach: { $in: currentUser.skillsToLearn },
    skillsToLearn: { $in: currentUser.skillsToTeach },
    teachingMode: { $in: currentUser.learningMode }
  });

  res.json(matches);
};
