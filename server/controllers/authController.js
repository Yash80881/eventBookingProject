const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const {sendOtpEmail} = require('../utils/email');
const jwt = require('jsonwebtoken');


const generateToken = (id,role) => {
    return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn: '7d'});
}

//register user
const registerUser = async (req,res) =>{
    const {name, email, password} = req.body;

    let userExists = await User.findOne({email: email});
    if(userExists){
        return res.status(400).json({message: "User Already Exists"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    try{
        const user = await User.create({name,email,password:hashPassword,role:'user',isVerified: false});
        
        const otp = Math.floor( Math.random() * 900000).toString();
        console.log(`Otp for ${email}: ${otp}`);
        await OTP.create({email,otp,action:'account_verification'});

        await sendOtpEmail(email,otp,'account_verification');

        res.status(201).json({
            message: 'User registered successfully. Please check your email for OTP to verify your account',
        email: user.email
        })
        
    }catch(error){
        res.status(400).json({error:error.message});
    }
}

//login user
const loginUser = async (req,res) =>{
    try{
        const {email,password} = req.body;

        let user = await User.findOne({email});
        if(!user){
            return res.status(404).json({error:'invalid credentials , Please sign up first !!!'});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({error:'Invalid credentials'});
        }
        if(!user.isVerified && user.role === 'user'){
            const otp = Math.floor( Math.random() * 900000).toString();

            await OTP.deleteMany({email,action:'account_verification'}); //remove old otps
            await OTP.create({email,otp,action:'account_verification'});
            await sendOtpEmail(email,otp,'account_verification');
            return res.status(400).json({
                error:'Account not verified . A new otp has been sent to your email.'
            })
        }

        res.json({
            message: 'Login successfull',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id,user.role)
        })
            
        
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
}

const verifyOtp = async (req,res) =>{
    const {email,otp} = req.body;
    // console.log('verifyOtp request body:', req.body);
    const otpRecord = await OTP.findOne({email,otp,action:'account_verification'});
    // console.log('verifyOtp db lookup otpRecord:', otpRecord);

    if(!otpRecord){
        return res.status(400).json({error:'Invalid or expired otp.'});
    }

    const user = await User.findOneAndUpdate({email},{isVerified:true},{new:true});
    await OTP.deleteMany({email,action:'account_verification'}); // remove used otps
    res.json({
        message: 'Account verified successfully. You can now log in.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id,user.role)
    });
};

module.exports = {registerUser,loginUser,verifyOtp};