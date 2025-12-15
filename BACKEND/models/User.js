const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  skillsToTeach: [String],
  skillsToLearn: [String],

  teachingMode: {
    type: [String],
    enum: ["online", "offline"]
  },

  learningMode: {
    type: [String],
    enum: ["online", "offline"]
  },

  location: {
    city: String,
    state: String
  }
});

module.exports = mongoose.model("User", userSchema);
