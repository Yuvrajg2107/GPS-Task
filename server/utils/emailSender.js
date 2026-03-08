const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Updated Transporter to bypass IPv6 issues
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // Do not fail on invalid certs (helps in some hosting environments)
        rejectUnauthorized: false 
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
        return false; 
    }
};

module.exports = sendEmail;