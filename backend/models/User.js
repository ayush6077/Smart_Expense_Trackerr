const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    default: ''
  },
  avatar_url: {
    type: String,
    default: ''
  },
  preferred_currency: {
    type: String,
    default: 'USD'
  },
  monthly_budget: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
