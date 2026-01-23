const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public Route
router.post('/login', authController.login);

// Protected Routes (Only Admin can access)
router.post('/register', verifyToken, checkRole(['admin']), authController.registerUser);
router.get('/users', verifyToken, checkRole(['admin']), authController.getUsers);

// NEW: Update and Delete Routes
router.put('/:id', verifyToken, checkRole(['admin']), authController.updateUser);
router.delete('/:id', verifyToken, checkRole(['admin']), authController.deleteUser);

module.exports = router;