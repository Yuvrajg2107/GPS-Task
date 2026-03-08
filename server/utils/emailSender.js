const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const dns = require('dns'); // Built-in Node.js module

// 1. FORCE IPv4: This single line fixes the ENETUNREACH IPv6 error
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

// 2. USE PORT 587: More universally unblocked than 465
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, 
    secure: false, // MUST be false when using port 587
    requireTLS: true, // Upgrades the connection to secure automatically
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Prevents local certificate errors
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