const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Create (Send)
router.post('/create', verifyToken, checkRole(['admin']), upload.array('files'), notificationController.createNotification);

// History (Admin Only)
router.get('/all', verifyToken, checkRole(['admin']), notificationController.getAllNotifications);

// Delete (Admin Only)
router.delete('/:id', verifyToken, checkRole(['admin']), notificationController.deleteNotification);

// User View
router.get('/my', verifyToken, notificationController.getMyNotifications);

// Add this route to fetch attachments
router.get('/:id/attachments', verifyToken, notificationController.getAttachments);

module.exports = router;