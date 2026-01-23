const db = require('../db');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // REMOVED for clear text requirement

// 1. LOGIN LOGIC
exports.login = async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM Users WHERE phone_number = ?', [phone_number]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];

        // Check password (PLAIN TEXT COMPARISON)
        // previously: await bcrypt.compare(password, user.password_hash);
        if (password !== user.password) {
            return res.status(400).json({ error: "Invalid Password" });
        }

        // Create Token
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ message: "Login Successful", token, user: { id: user.id, name: user.name, role: user.role, department: user.department } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. CREATE USER LOGIC (Admin Only)
exports.registerUser = async (req, res) => {
    try {
        const { name, phone_number, password, role, department, gender } = req.body;

        // Check if phone number already exists
        const [existing] = await db.query('SELECT * FROM Users WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) return res.status(400).json({ error: "Phone number already exists" });

        // Insert into DB (PLAIN TEXT PASSWORD)
        await db.query(
            'INSERT INTO Users (name, phone_number, password, role, department, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone_number, password, role, department, gender]
        );

        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GET ALL USERS (Modified to return Phone & Password)
exports.getUsers = async (req, res) => {
    try {
        const { role, department } = req.query; 
        
        // Select all necessary fields including password and phone_number
        let query = "SELECT id, name, phone_number, password, role, department, gender FROM Users WHERE role != 'admin'";
        let params = [];

        if (role) {
            query += " AND role = ?";
            params.push(role);
        }
        if (department) {
            query += " AND department = ?";
            params.push(department);
        }

        query += " ORDER BY id DESC"; // Show newest users first

        const [results] = await db.query(query, params);
        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE USER (New)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone_number, password, role, department, gender } = req.body;

        await db.query(
            'UPDATE Users SET name=?, phone_number=?, password=?, role=?, department=?, gender=? WHERE id=?',
            [name, phone_number, password, role, department, gender, id]
        );

        res.json({ message: "User Updated Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE USER (New)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Users WHERE id = ?', [id]);
        res.json({ message: "User Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};