const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// 1. Verify Token (Is the user logged in?)
exports.verifyToken = (req, res, next) => {
    // Get token from header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: "Access Denied. No Token Provided." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user info (id, role) to the request
        next(); // Move to the next function (the controller)
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

// 2. Check Role (Is the user an Admin?)
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access Denied. You do not have permission." });
        }
        next();
    };
};