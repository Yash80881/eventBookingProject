const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const OTP = require('../models/OTP');

async function main() {
  const email = process.argv[2];
  if(!email){
    console.error('Usage: node getOtp.js <email>');
    process.exit(1);
  }

  try{
    await mongoose.connect(process.env.MONGO_URL);
    const record = await OTP.findOne({ email, action: 'account_verification' }).sort({ createdAt: -1 }).lean();
    if(!record){
      console.log('No OTP found for', email);
      process.exit(0);
    }
    console.log(`OTP for ${email}: ${record.otp}`);
    process.exit(0);
  }
  catch(err){
    console.error('Error fetching OTP:', err.message || err);
    process.exit(2);
  }
}

main();
