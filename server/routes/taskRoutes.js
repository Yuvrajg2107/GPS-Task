const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController'); // Import this
const upload = require('../middleware/uploadMiddleware');

// Create Task (Admin only, handles multiple files)
router.post('/create', verifyToken, checkRole(['admin']), upload.array('files'), taskController.createTask);

// Get Tasks (Admin sees all, Users see theirs)
router.get('/', verifyToken, taskController.getTasks);

router.get('/stats', verifyToken, taskController.getUserStats);

// Update Status (Users update their own status)
router.put('/:taskId/status', verifyToken, taskController.updateTaskStatus);
router.post('/remind', verifyToken, checkRole(['admin']), notificationController.sendReminder);

router.get('/:taskId/attachments', verifyToken, taskController.getTaskAttachments);
router.get('/admin-stats', verifyToken, checkRole(['admin']), taskController.getAdminStats);
// Add these new routes:
router.delete('/:id', verifyToken, checkRole(['admin']), taskController.deleteTask);
router.put('/:id', verifyToken, checkRole(['admin']), taskController.updateTaskDetails);

module.exports = router;