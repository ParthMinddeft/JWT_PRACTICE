const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {requireAuth, checkUser} = require('./middlewares/authmiddleware') 
const authroute = require('./routes/auth_route')
const app = express()
app.use(express.json())
app.use(authroute) 

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))

app.use(bodyParser.json())

app.use(cookieParser())

app.set('view engine','ejs')

const db = "mongodb://127.0.0.1:27017/practicejwt"

mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then((result) => {
    app.listen(9000,() => {
        console.log('connected')
    })
})
.catch((err) => console.log(err))

app.get('*',checkUser)

app.get('/',(req,res) => {
    res.render('login')
})

app.get('/dashboard',requireAuth,(req,res) => {
    res.render('dashboard')
})