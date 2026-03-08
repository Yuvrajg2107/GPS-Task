const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// FIX: Import both the Multer config AND the Supabase uploader
const { upload, uploadToSupabase } = require('../middleware/uploadMiddleware');

// === ROUTES ===

// Create Notification (Send)
router.post('/create', 
    verifyToken, 
    checkRole(['admin']), 
    upload.array('files'), // Step 1: Multer grabs files
    uploadToSupabase,      // Step 2: Uploads to Supabase & gets public URL
    notificationController.createNotification // Step 3: Saves notification DB
);
router.post('/remind', verifyToken, taskController.sendReminder);
// History (Admin Only)
router.get('/all', verifyToken, checkRole(['admin']), notificationController.getAllNotifications);

// User View (My Notifications)
router.get('/my', verifyToken, notificationController.getMyNotifications);

// Attachments
router.get('/:id/attachments', verifyToken, notificationController.getAttachments);

// Delete (Admin Only)
router.delete('/:id', verifyToken, checkRole(['admin']), notificationController.deleteNotification);

module.exports = router;