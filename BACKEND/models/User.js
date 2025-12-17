const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    skillsToTeach: {
      type: [String],
      default: []
    },

    skillsToLearn: {
      type: [String],
      default: []
    },

    teachingMode: {
      type: [String],
      enum: ["online", "offline"],
      default: []
    },

    learningMode: {
      type: [String],
      enum: ["online", "offline"],
      default: []
    },

    location: {
      city: {
        type: String,
        default: ""
      },
      state: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
