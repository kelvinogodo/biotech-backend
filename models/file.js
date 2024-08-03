const mongoose = require('mongoose')

const pdf = new mongoose.Schema(
  {
    file_url: { type: String },
  }
)
const Pdf = mongoose.models.Pdf || mongoose.model('Pdf', pdf)
module.exports = Pdf