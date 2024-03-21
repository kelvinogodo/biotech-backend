const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Admin = require('./models/admin')
const jwt = require('jsonwebtoken')
dotenv.config()

const app = express()

const port = process.env.PORT

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.ATLAS_URI)

app.post('/api/register', async (req, res) => {
  
  try {
     await User.create({
      fullname: req.body.fullname,
      membertype:req.body.userName,
      email: req.body.email,
      password: req.body.password,
      phonenumber:req.body.phone
    });
    
  } catch (error) {
    console.log(error)
    return res.json({ status: true, error: error })
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
      firstname: user.firstname,
    })
  } catch (error) {
    res.json({ status: 'error' })
  }
})


app.post('/api/updateUserData', async(req,res)=>{
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


app.post('/api/admin', async (req, res) => {
  const admin = await Admin.findOne({email:req.body.email})
  if(admin){
      return res.json({status:200})
  }
  else{
    return res.json({status:400})
  }
})


app.post('/api/deleteUser', async (req, res) => {
  try {
      await User.deleteOne({email:req.body.email})
      return res.json({status:200})
  } catch (error) {
    return res.json({status:500,msg:`${error}`})
  }
})

app.post('/api/upgradeUser', async (req, res) => {
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


app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})

