const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/authRoutes'); // NEW: Import Routes
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // NEW: Use Routes

const taskRoutes = require('./routes/taskRoutes'); // Import
app.use('/api/tasks', taskRoutes); // Use
app.use('/uploads', express.static('uploads')); 
app.use('/api/notifications', notificationRoutes);
// Test Route
app.get('/', (req, res) => {
    res.send("API is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});