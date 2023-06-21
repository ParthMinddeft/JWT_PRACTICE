const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        lowercase:true,
        validate:[isEmail,"Please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"Please enter a password"],
        minlength:[6,"Minimum password length is 6"]
    },
    otp:{
        type:String,
        required:true,
    },
});

userSchema.pre('save',async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

userSchema.statics.login = async function(email,password){
    const USER = await this.findOne({email})
    if(USER){
        const auth = await bcrypt.compare(password,USER.password)
        if(auth)
        {
            return USER
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect email')
}
const User = mongoose.model('userData',userSchema)
module.exports = User;