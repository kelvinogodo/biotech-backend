const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Admin = require('./models/admin')
const Post = require('./models/post')
const jwt = require('jsonwebtoken')
dotenv.config()

const app = express()

const port = process.env.PORT

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.ATLAS_URI).then(()=> {console.log("db connected")})

app.post('/api/register', async (req, res) => {
  
  try {
     await User.create({
      fullname: req.body.fullname,
      membertype:req.body.membertype,
      email: req.body.email,
      password: req.body.password,
      phone:req.body.phone
    });
    return res.json({ status: 200 })
  } catch (error) {
    return res.json({ status: 'error', error: error })
  }
})

app.post('/api/createPost', async (req, res) => {
  try {
    await Post.create(req.body);
    const newPostArray = await Post.find()
    res.json({status:'ok', posts: newPostArray})
  } catch (error) {
    return res.json({ status: 'error', error: error })
  }
})

app.get('/api/getData', async (req, res) => {
  const token = req.headers['x-access-token']
  try {
    const decode = jwt.verify(token, 'secret1258')
    const email = decode.email
    const user = await User.findOne({ email: email })
    res.json({
      status: 'ok',
      fullname: user.firstname,
      phone: user.phone,
      membertype: user.membertype,
      email: user.email,
    })
  } catch (error) {
    res.json({ status: 'error' })
  }
})


app.patch('/api/updateUserData', async(req,res)=>{
  const token = req.headers['x-access-token']
  try {
    const decode = jwt.verify(token, 'secret1258')
    const email = decode.email
    const user = await User.findOne({ email: email })
  } catch (error) {
    console.log(error)
    return res.json({status:500})
  }
})

app.patch('/api/editPost', async(req,res)=>{
  try {
    await Post.updateOne({ _id: req.body.id }, {
      $set: { body: req.body.body,title:req.body.title, url:req.body.url }
    })
    return res.json({status:'ok'})
  } catch (error) {
    return res.json({status:500})
  }
})


app.post('/api/admin', async (req, res) => {
  const admin = await Admin.findOne({email:req.body.email})
  if(admin){
      return res.json({status:200})
  }
  else{
    return res.json({status:400})
  }
})

app.delete('/api/deletePost', async (req, res) => {
 try {
   await Post.deleteOne({ _id: req.body.id })
        return res.json({status:200})
    } catch (error) {
        console.log(error)
       return res.json(error)
    }
})

app.delete('/api/deleteUser', async (req, res) => {
  try {
    await User.deleteOne({ email: req.body.email })
    const users = User.find()
      return res.json({status:200, users:users})
  } catch (error) {
    return res.json({status:500,msg:`${error}`})
  }
})

app.patch('/api/upgradeUser', async (req, res) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email: email })
  }
  catch (error) {
    res.json({
        status: 'error',
      })
  }
})


app.post('/api/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })
  if (user) {
    if( user.password !== req.body.password){
      return res.json({ status: 404, })
    }
    const token = jwt.sign(
      {
        email: user.email,
        password: user.password
      },
      'secret1258'
    )
    await User.updateOne({email: user.email},{$set:{rememberme : req.body.rememberme}})
    return res.json({ status: 'ok', user: token })
  }
  
  else {
    return res.json({ status: 'error', user: false })
  }
})

app.get('/api/getUsers', async (req, res) => {
  const users = await User.find()
  res.json(users)
})


app.get('/api/posts/:id', async(req,res)=>{
  try {
    const post = await Post.findOne({_id:req.params.id})
    if(!post){
      return res.json({message:'post not found'})
    } else {
      return res.json({status:200,post:post})
    }
  } catch (error) {
    return res.json({status:404})
  }
})

app.get('/api/fetchPosts', async (req, res) => {
  const posts = await Post.find()
    if(posts != []){ res.status(200).json(posts)}
    else{ res.status(200).json([])}
})


app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})

