const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send an email
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"GPS Task Manager" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent successfully to ${to} (${info.messageId})`);
        return true;
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
        return false; // We return false instead of throwing so the app doesn't crash if an email fails
    }
};

module.exports = sendEmail;