const User = require('../models/users')
const {generateOTP} = require('../services/otp')
const {sendMail} = require('../services/mail')
const jwt = require('jsonwebtoken')

const maxAge = 3*24*60*60

const createToken = (id) => {
    return jwt.sign({id},'secret',{
        expiresIn:maxAge
    })
}

module.exports.signup_get = (req,res) => {
    res.render('signup')
}

const handleErrors = (err) => {
    console.log(err.message,err.code)
    let errors = {
        email:'',
        password:''
    }

    if(err.message === 'incorrect email')
    {
        errors.email = 'This email is not register';
    }
    if(err.message === 'incorrect password')
    {
        errors.password = 'This password is incorrect';
    }
    if(err.code === 11000)
    {
        errors.email = 'this email is already register';
        return errors;
    }
    // if(err.message.includes('user validation failed'))
    // {
    //     Object.values(err.errors).forEach(({properties}) => {
    //         errors[properties.path] = properties.message;
    //     });
    // }
    // return errors
}

// module.exports.signup_post = async (req,res) => {
//     const {email,password} = req.body;
//     try {
//         const userdata = await User.create({
//             email,password,
//         });
//         const token = createToken(userdata._id)
//         res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge})

//         res.status(201).json({userData:userdata._id})
//     } catch (err) {
//         console.log(err)
//         const errors = handleErrors(err)
//         res.status(400).json({err})
//     }
// }

module.exports.signUpUser = async (req, res) => {
    const { email, password } = req.body;
    const isExisting = await findUserByEmail(email);
    if (isExisting) {
      return res.send('Already existing');
    }
    // create new user
    const newUser = await createUser(email, password);
    if (!newUser[0]) {
      return res.status(400).send({
        message: 'Unable to create new user',
      });
    }
    res.send(newUser);
};

const createUser = async (email,password) => {
    const hashedPassword = await encrypt(password);
    const otpGenerated = generateOTP();
    const newUser = await User.create({
        email,
        password: hashedPassword,
        otp: otpGenerated,
    });
    if (!newUser) {
        return [false, 'Unable to sign you up'];
    }
    try {
        await sendMail({
          to: email,
          OTP: otpGenerated,
        });
        return [true, newUser];
      } catch (error) {
        return [false, 'Unable to sign up, Please try again later', error];
    }
}

module.exports.login_post = async (req,res) => {
    const {email,password} = req.body
    try {
        const fetch = await User.login(email,password)
        const token = createToken(fetch._id)
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge})
        res.status(200).json({fetchData:fetch._id})
    } catch (e) {
        console.log(e)
        const errors = handleErrors(e)
        res.status(400).json({e})
    }
}

module.exports.login_get = (req,res) => {
    res.render('login')
}

module.exports.verifyEmail = async (req,res) => {
    const {email,otp} = req.body;
    const user = await validateUserSignUp(email,otp);
    res.send(user);
}

const findUserByEmail = async(email) => {
    const user = await User.findOne({
        email,
    });
    if(!user)
    {
        return false;
    }
    return user;
}

const validateUserSignUp = async(email,otp) => {
    const user = await User.findOne({
        email,
    });
    if(!user)
    {
        return [false,'User Not Found'];
    }
    if(user && user.otp !== otp)
    {
        return [false,'Invalid OTP'];
    }
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        $set: {active:true}
    });
    return [true,updatedUser];
};



