const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendBookingEmail = async (userEmail,userName,eventTitle) =>{
    try{
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed : ${eventTitle}`,
            html:`<h2>Hi ${userName}!</h2>
            <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
            <p>Thank you for choosing eventora</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`email successfully sent to ${userEmail}`);
    }
    catch(error){
        console.error(`Error sending email to ${userEmail}:`, error);
    }
}

const sendOtpEmail = async (userEmail , otp , type) =>{
    try{
        const title = type === 'account_verification' ? 'Verify your eventora account' : 'Eventora booking verification';
        const message = type === 'account_verification' ? 'Please use the following otp to verify your eventora account' : 'Please use the following otp to confirm and verify your event booking';

        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject:title,
        html: `
        <div style="font-family: Arial, sans-serif; text-align : center;padding :20px">
        <h2 style = " color: #111;">${title}</h2>
        <p style="color:#555; font-size:16px;">${message}</p>
        <div style = "margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background : #f4f4f4; width: max-content; letter-spacing: 5px;">
            ${otp}
        </div> 
        <p style="color:#999; font-size:12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
        </div>
        `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Otp sent for ${userEmail} for ${type}`);
    }
    catch(error){
        console.error(`error sending Otp email to ${userEmail} for ${type}:`,error);
    }
}

module.exports = {sendOtpEmail,sendBookingEmail};