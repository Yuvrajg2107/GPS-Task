// server/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load the .env file variables
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // IMPORTANT: Cloud databases require SSL (Secure Layer)
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

// Test the connection when the app starts
pool.getConnection()
    .then(connection => {
        console.log("✅ Successfully connected to TiDB Cloud Database!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Database Connection Failed:", err.message);
    });

module.exports = pool;