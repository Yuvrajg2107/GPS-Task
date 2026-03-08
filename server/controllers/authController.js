const db = require('../db');
const jwt = require('jsonwebtoken');

// 1. LOGIN LOGIC
exports.login = async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM Users WHERE phone_number = ?', [phone_number]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];

        // Check password (PLAIN TEXT COMPARISON)
        if (password !== user.password) {
            return res.status(400).json({ error: "Invalid Password" });
        }

        // Create Token (Included email in token just in case)
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, department: user.department, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ message: "Login Successful", token, user: { id: user.id, name: user.name, role: user.role, department: user.department, email: user.email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. CREATE USER LOGIC (Admin Only)
exports.registerUser = async (req, res) => {
    try {
        const { name, phone_number, email, password, role, department, gender } = req.body;

        // Check if phone number already exists
        const [existing] = await db.query('SELECT * FROM Users WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) return res.status(400).json({ error: "Phone number already exists" });

        // Insert into DB
        await db.query(
            'INSERT INTO Users (name, phone_number, email, password, role, department, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, phone_number, email, password, role, department, gender]
        );

        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GET ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const { role, department } = req.query; 
        
        // ADDED 'email' to the SELECT query
        let query = "SELECT id, name, phone_number, email, password, role, department, gender FROM Users WHERE role != 'admin'";
        let params = [];

        if (role) {
            query += " AND role = ?";
            params.push(role);
        }
        if (department) {
            query += " AND department = ?";
            params.push(department);
        }

        query += " ORDER BY id DESC";

        const [results] = await db.query(query, params);
        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE USER
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone_number, email, password, role, department, gender } = req.body;

        // ADDED 'email' to the UPDATE query
        await db.query(
            'UPDATE Users SET name=?, phone_number=?, email=?, password=?, role=?, department=?, gender=? WHERE id=?',
            [name, phone_number, email, password, role, department, gender, id]
        );

        res.json({ message: "User Updated Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Users WHERE id = ?', [id]);
        res.json({ message: "User Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};