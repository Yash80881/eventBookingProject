const SibApiV3Sdk = require('@getbrevo/brevo');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const getSenderEmail = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

const sendMail = async ({ to, subject, html }) => {
    const senderEmail = getSenderEmail();

    if (!senderEmail) {
        throw new Error('Email sender is missing. Set EMAIL_FROM in deployment.');
    }

    if (!process.env.BREVO_API_KEY) {
        throw new Error('Brevo API key is missing. Set BREVO_API_KEY in deployment.');
    }

    await apiInstance.sendTransacEmail({
        sender: { email: senderEmail, name: 'Eventora' },
        to: [{ email: to }],
        subject,
        htmlContent: html
    });
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const html = `
            <h2>Hi ${userName}!</h2>
            <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
            <p>Thank you for choosing Eventora.</p>
        `;
        await sendMail({
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html
        });
        console.log('Email sent successfully to', userEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const html = `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #111;">${title}</h2>
                <p style="color: #555; font-size: 16px;">${msg}</p>
                <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                    ${otp}
                </div>
                <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
            </div>
        `;
        await sendMail({ to: userEmail, subject: title, html });
        console.log(`OTP sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };