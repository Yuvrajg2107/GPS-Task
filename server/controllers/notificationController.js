const db = require('../db');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Create Notification
exports.createNotification = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { title, message, target_dept, target_role, specific_recipient_ids } = req.body;
        const sender_id = req.user.id;
        const files = req.files || []; 

        const [result] = await connection.query(
            'INSERT INTO Notifications (title, message, sender_id, target_dept, target_role) VALUES (?, ?, ?, ?, ?)',
            [title, message, sender_id, target_dept || null, target_role || null]
        );
        const notificationId = result.insertId;

        if (specific_recipient_ids) {
            const recipients = JSON.parse(specific_recipient_ids);
            if (recipients.length > 0) {
                const recipientValues = recipients.map(uid => [notificationId, uid]);
                await connection.query(
                    'INSERT INTO NotificationRecipients (notification_id, user_id) VALUES ?',
                    [recipientValues]
                );
            }
        }

        if (files.length > 0) {
            const fileValues = files.map(file => [notificationId, 'NOTIFICATION', file.path, file.mimetype]);
            await connection.query(
                'INSERT INTO Attachments (related_id, related_to, file_url, file_type) VALUES ?',
                [fileValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Notification Sent Successfully!" });

    } catch (err) {
        await connection.rollback();
        console.error("Notification Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 2. Get All Notifications
exports.getAllNotifications = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT n.*, 
                   GROUP_CONCAT(u.name SEPARATOR ', ') as recipient_names 
            FROM Notifications n
            LEFT JOIN NotificationRecipients nr ON n.id = nr.notification_id
            LEFT JOIN Users u ON nr.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += " AND n.title LIKE ?";
            params.push(`%${search}%`);
        }

        query += " GROUP BY n.id ORDER BY n.created_at DESC";

        const [notifs] = await db.query(query, params);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get My Notifications
exports.getMyNotifications = async (req, res) => {
    try {
        const { department, role, id } = req.user;
        
        const robustQuery = `
            SELECT DISTINCT n.* FROM Notifications n
            LEFT JOIN NotificationRecipients nr ON n.id = nr.notification_id
            WHERE 
               (n.target_dept = ? AND n.target_role IS NULL) 
            OR (n.target_role = ? AND n.target_dept IS NULL) 
            OR (n.target_dept = ? AND n.target_role = ?)     
            OR nr.user_id = ?                                
            OR (n.target_dept IS NULL AND n.target_role IS NULL AND NOT EXISTS (SELECT 1 FROM NotificationRecipients WHERE notification_id = n.id)) 
            ORDER BY n.created_at DESC
        `;

        const [notifs] = await db.query(robustQuery, [department, role, department, role, id]);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Send Reminder
exports.sendReminder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { user_id, task_heading } = req.body; 
        const sender_id = req.user.id; 

        const title = "Task Reminder";
        const message = `Reminder: Your task "${task_heading}" is pending or nearing its deadline. Please update the status.`;

        const [result] = await connection.query(
            'INSERT INTO Notifications (title, message, sender_id) VALUES (?, ?, ?)',
            [title, message, sender_id]
        );
        const notificationId = result.insertId;

        await connection.query(
            'INSERT INTO NotificationRecipients (notification_id, user_id) VALUES (?, ?)',
            [notificationId, user_id]
        );

        await connection.commit();
        res.json({ message: "Reminder sent successfully!" });

    } catch (err) {
        await connection.rollback();
        console.error("Reminder Error:", err); 
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 5. DELETE NOTIFICATION (Updated to Delete Files from Supabase)
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch file URLs associated with this notification
        const [files] = await db.query(
            'SELECT file_url FROM Attachments WHERE related_id = ? AND related_to = "NOTIFICATION"', 
            [id]
        );

        // 2. Delete files from Supabase Storage
        if (files.length > 0) {
            const filePaths = files.map(f => {
                const parts = f.file_url.split('/task-files/');
                return parts.length > 1 ? parts[1] : null;
            }).filter(p => p !== null);

            if (filePaths.length > 0) {
                const { error } = await supabase.storage
                    .from('task-files')
                    .remove(filePaths);
                
                if (error) console.error("Supabase File Delete Error:", error);
            }
        }

        // 3. Delete Notification from DB
        await db.query('DELETE FROM Notifications WHERE id = ?', [id]);
        res.json({ message: "Notification and files Deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Get Attachments
exports.getAttachments = async (req, res) => {
    try {
        const { id } = req.params;
        const [files] = await db.query(
            'SELECT * FROM Attachments WHERE related_id = ? AND related_to = "NOTIFICATION"', 
            [id]
        );
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};