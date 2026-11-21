const mongoose = require('mongoose');

const demographicsSchema = new mongoose.Schema(
  {
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true, // e.g., 'SC', 'ST', 'OBC', 'Safai Karamchari', 'General', 'DNT'
    },
    annual_income: {
      type: Number,
      min: 0,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    hashed_password: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    demographics: {
      type: demographicsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if demographics profile has minimum required details
userSchema.methods.hasCompleteProfile = function () {
  const d = this.demographics;
  return !!(d && d.age && d.category && d.annual_income !== undefined);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
