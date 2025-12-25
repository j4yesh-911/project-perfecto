const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: "",
    },
    name: String,
    username: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: String,

    age: Number,
    gender: String,
    phone: String,
    location: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },

    skillsToTeach: [String],
    skillsToLearn: [String],

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

     swappers:[
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
  },
  { timestamps: true }


);

// Add indexes for better query performance
userSchema.index({ isProfileComplete: 1 });
userSchema.index({ email: 1 });
userSchema.index({ _id: 1, isProfileComplete: 1 }); // Compound index for getAllUsers query

module.exports = mongoose.model("User", userSchema);
