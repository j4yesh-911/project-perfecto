const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profilePic: {
  type: String,
  default: "",
    },
    name: String,
    username: String,
    email: String,
    password: String,

    age: Number,
    gender: String,
    phone: String,
    address: String,

    skillsToTeach: [String],
    skillsToLearn: [String],

    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
