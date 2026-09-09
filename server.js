const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Post = require('./models/post')
const Pdf = require('./models/file')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
dotenv.config()

const app = express()

const port = process.env.PORT

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.ATLAS_URI).then(()=> {console.log("db connected")})

const requireAdmin = async (req, res, next) => {
  const token = req.headers['x-access-token']
  try {
    const decode = jwt.verify(token, 'secret1258')
    const user = await User.findOne({ email: decode.email })
    if (!user || !user.isAdmin) {
      return res.status(403).json({ status: 'error', error: 'admin only' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ status: 'error', error: 'unauthorized' })
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const referredBy = req.body.referredBy
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const newUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      membertype: req.body.membertype,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      referredBy: referredBy || undefined,
    });

    if (referredBy) {
      await User.updateOne(
        { email: referredBy },
        { $push: { referred: newUser.email } }
      )
    }

    return res.json({ status: 200 })
  } catch (error) {
    console.log(error)
    return res.json({ status: 'error', error: error })
  }
})

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })
  if (user) {
    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
      return res.json({ status: 404 })
    }
    const token = jwt.sign(
      {
        email: user.email,
        password: user.password
      },
      'secret1258'
    )
    return res.json({ status: 'ok', user: token })
  }

  else {
    return res.json({ status: 'error', user: false })
  }
})

app.get('/api/verify', async (req, res) => {
  const token = req.headers['x-access-token']
  try {
    jwt.verify(token, 'secret1258')
    return res.json({ status: 'ok' })
  } catch (error) {
    return res.json({ status: 'error' })
  }
})

app.get('/api/getData', async (req, res) => {
  const token = req.headers['x-access-token']
  try {
    const decode = jwt.verify(token, 'secret1258')
    const email = decode.email
    const user = await User.findOne({ email: email })
    const referred = await User.find(
      { email: { $in: user.referred } },
      'firstname lastname email membertype'
    )
    res.json({
      status: 'ok',
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      membertype: user.membertype,
      email: user.email,
      country: user.country,
      state: user.state,
      address: user.address,
      zipcode: user.zipcode,
      profilepicture: user.profilepicture,
      referredBy: user.referredBy,
      referred: referred,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    })
  } catch (error) {
    res.json({ status: 'error' })
  }
})

app.post('/api/updateUserData', async (req, res) => {
  const token = req.headers['x-access-token']
  try {
    const decode = jwt.verify(token, 'secret1258')
    const email = decode.email
    await User.updateOne({ email: email }, {
      $set: {
        country: req.body.country,
        state: req.body.state,
        address: req.body.address,
        zipcode: req.body.zipcode,
        profilepicture: req.body.profilepicture,
        phone: req.body.phone,
      }
    })
    return res.json({ status: 'ok' })
  } catch (error) {
    console.log(error)
    return res.json({ status: 500 })
  }
})

app.get('/api/fetchPosts', async (req, res) => {
  const posts = await Post.find()
  if (posts != []) { res.status(200).json(posts) }
  else { res.status(200).json([]) }
})

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id })
    if (!post) {
      return res.json({ message: 'post not found' })
    } else {
      return res.json({ status: 200, post: post })
    }
  } catch (error) {
    return res.json({ status: 404 })
  }
})

app.post('/api/createPost', requireAdmin, async (req, res) => {
  try {
    await Post.create(req.body);
    const newPostArray = await Post.find()
    res.json({ status: 'ok', posts: newPostArray })
  } catch (error) {
    return res.json({ status: 'error', error: error })
  }
})

app.patch('/api/editPost', requireAdmin, async (req, res) => {
  try {
    await Post.updateOne({ _id: req.body.id }, {
      $set: { body: req.body.body, title: req.body.title, url: req.body.url }
    })
    return res.json({ status: 'ok' })
  } catch (error) {
    return res.json({ status: 500 })
  }
})

app.delete('/api/deletePost', requireAdmin, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.body.id })
    return res.json({ status: 200 })
  } catch (error) {
    console.log(error)
    return res.json(error)
  }
})

app.get('/api/fetchPdfs', async (req, res) => {
  const pdfs = await Pdf.find()
  if (pdfs != []) { res.status(200).json(pdfs) }
  else { res.status(200).json([]) }
})

app.post('/api/createIndex', requireAdmin, async (req, res) => {
  try {
    await Pdf.create(req.body);
    const newPostArray = await Pdf.find()
    res.json({ status: 'ok', pdfs: newPostArray })
  } catch (error) {
    return res.json({ status: 'error', error: error })
  }
})

app.delete('/api/deletePdf', requireAdmin, async (req, res) => {
  try {
    await Pdf.deleteOne({ file_url: req.body.id })
    return res.json({ status: 200 })
  } catch (error) {
    console.log(error)
    return res.json(error)
  }
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})
