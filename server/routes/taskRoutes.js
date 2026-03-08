const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const notificationController = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// FIX: Import both the Multer config AND the Supabase uploader
const { upload, uploadToSupabase } = require('../middleware/uploadMiddleware');

// === ROUTES ===

// Create Task (Admin only)
router.post('/create', 
    verifyToken, 
    checkRole(['admin']), 
    upload.array('files'), // Step 1: Multer grabs files from request
    uploadToSupabase,      // Step 2: Uploads to Supabase & gets public URL
    taskController.createTask // Step 3: Saves task with file URL to DB
);

// Get Tasks
router.get('/', verifyToken, taskController.getTasks);

// Stats
router.get('/stats', verifyToken, taskController.getUserStats);
router.get('/admin-stats', verifyToken, checkRole(['admin']), taskController.getAdminStats);

// Update Status & Details
router.put('/:taskId/status', verifyToken, taskController.updateTaskStatus);
router.put('/:id', verifyToken, checkRole(['admin']), taskController.updateTaskDetails);

// Reminder
router.post('/remind', verifyToken, taskController.sendReminder);

// Attachments
router.get('/:taskId/attachments', verifyToken, taskController.getTaskAttachments);

// Deletion
router.delete('/:id', verifyToken, checkRole(['admin']), taskController.deleteTask);
router.delete('/:taskId/assignment/:userId', verifyToken, checkRole(['admin']), taskController.deleteTaskAssignment);

module.exports = router;