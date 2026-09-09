const mongoose = require('mongoose')

const user = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    membertype: {
      type: String,
      required: true,
      enum: ['student', 'associate II', 'associate I', 'graduate member', 'member', 'fellow']
    },
    country: { type: String },
    state: { type: String },
    address: { type: String },
    zipcode: { type: String },
    profilepicture: { type: String },
    referredBy: { type: String },
    referred: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  }
)
const User = mongoose.models.User || mongoose.model('User', user)
module.exports = User
