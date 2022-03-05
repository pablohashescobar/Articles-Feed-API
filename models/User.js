const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  article_preferences: {
    type: [String],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
    default: null,
  },
  otp_expiry: {
    type: Date,
    default: null,
  },
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = User = mongoose.model("user", UserSchema);
