const jwt = require('jsonwebtoken');
const User = require('../models/User.js');


//user authorization middleware
//check whether user is login
const protect = async (req,res,next) =>{
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
    if(token){
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if(!req.user){
                return res.status(401).json({message:'Not authorised , user not found'});
            }
            next();        
        }
        catch(error){
            return res.status(401).json({ message: 'Not authorised, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorised, no token' });
    }
}

const admin =  async (req,res,next) =>{
    if(req.user && req.user.role === 'admin'){
        next();
    }
    else{
        return res.status(401).json({message:'Forbidden ! Admin access required'});
    }
}

module.exports = { protect , admin};

