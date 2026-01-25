const db = require('../db');

// 1. Create Notification
exports.createNotification = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { title, message, target_dept, target_role, specific_recipient_ids } = req.body;
        const sender_id = req.user.id;
        const files = req.files || []; // Middleware has added .path here

        // 1. Insert the Main Message
        const [result] = await connection.query(
            'INSERT INTO Notifications (title, message, sender_id, target_dept, target_role) VALUES (?, ?, ?, ?, ?)',
            [title, message, sender_id, target_dept || null, target_role || null]
        );
        const notificationId = result.insertId;

        // 2. Handle Specific Recipients
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

        // 3. Handle Attachments
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

// 2. Get All Notifications (Admin History)
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
               (n.target_dept = ? AND n.target_role IS NULL) -- Dept Match
            OR (n.target_role = ? AND n.target_dept IS NULL) -- Role Match
            OR (n.target_dept = ? AND n.target_role = ?)     -- Both Match
            OR nr.user_id = ?                                -- Specific Match
            OR (n.target_dept IS NULL AND n.target_role IS NULL AND NOT EXISTS (SELECT 1 FROM NotificationRecipients WHERE notification_id = n.id)) -- Global Broadcast
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

// 5. Delete Notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Notifications WHERE id = ?', [id]);
        res.json({ message: "Notification Deleted" });
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