const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    address: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    roles: {
      type: [String],
      enum: ["user", "admin", "editor", "manager", "moderator"],
      default: ["user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
