const mongoose = require('mongoose')

const user = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, required: true},
    membertype: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    transaction: { type: [Object] },
    userHistory:{type:[Object]}
  }
)
const User = mongoose.models.User || mongoose.model('User', user)
module.exports = User