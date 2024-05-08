const mongoose = require('mongoose')

const post = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true},
    date: { type: String, required: true },
    author: { type: String },
    url: { type: String },
  }
)
const Post = mongoose.models.Post || mongoose.model('Post', post)
module.exports = Post