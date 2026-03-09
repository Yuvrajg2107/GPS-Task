const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Function to send an email using Brevo REST API (Bypasses Render's SMTP Block)
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: "GPS Task Manager",
                    email: process.env.SENDER_EMAIL // The email you used to sign up for Brevo
                },
                to: [
                    { email: to }
                ],
                subject: subject,
                htmlContent: htmlContent
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );

        console.log(`✉️ Email sent successfully to ${to} via Brevo API`);
        return true;
    } catch (error) {
        // Log detailed error from Brevo if it fails dscvqwdvvwvvw
        console.error("❌ Email Sending Failed:", error.response ? error.response.data : error.message);
        return false; 
    }
};

module.exports = sendEmail;