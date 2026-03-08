const db = require('../db');
const { createClient } = require('@supabase/supabase-js');
const sendEmail = require('../utils/emailSender'); // IMPORT EMAIL UTILITY
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. CREATE TASK (Admin Only) - NOW WITH EMAIL NOTIFICATION
exports.createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        const { category, heading, description, end_date, assigned_to } = req.body;
        const assigned_by = req.user.id;
        const files = req.files || []; 

        if (!category || !heading || !assigned_to) throw new Error("Missing Category, Heading, or Assigned Users");

        let assignedUserIds;
        try { assignedUserIds = JSON.parse(assigned_to); } 
        catch (e) { throw new Error("Invalid assigned_to format."); }

        if (assignedUserIds.length === 0) throw new Error("No users selected.");

        const formattedEndDate = new Date(end_date).toISOString().slice(0, 19).replace('T', ' ');
        const formattedStartDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Step 1: Insert Task Details
        const [taskResult] = await connection.query(
            'INSERT INTO Tasks (heading, category, description, assigned_by, end_date) VALUES (?, ?, ?, ?, ?)',
            [heading, category, description, assigned_by, formattedEndDate]
        );
        const taskId = taskResult.insertId;

        // Step 2: Assign to Users
        const assignmentValues = assignedUserIds.map(userId => [
            taskId, userId, 'viewed', formattedStartDate 
        ]);

        await connection.query(
            'INSERT INTO TaskAssignments (task_id, user_id, status, assigned_at) VALUES ?',
            [assignmentValues]
        );

        // Step 3: Save File Info
        if (files.length > 0) {
            const fileValues = files.map(file => [taskId, 'TASK', file.path, file.mimetype]);
            await connection.query(
                'INSERT INTO Attachments (related_id, related_to, file_url, file_type) VALUES ?',
                [fileValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Task Assigned Successfully!" });

        // ==========================================
        // 📧 SEND EMAIL TO ALL ASSIGNED USERS (ASYNC)
        // ==========================================
        try {
            // Fetch the emails and names of the assigned users
            const placeholders = assignedUserIds.map(() => '?').join(',');
            const [users] = await db.query(
                `SELECT name, email FROM Users WHERE id IN (${placeholders}) AND email IS NOT NULL`, 
                assignedUserIds
            );

            // Format dates for the email
            const emailDueDate = new Date(end_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            // Send an email to each user
            for (let user of users) {
                if (user.email) {
                    const subject = `🔔 New Task Assigned: ${heading}`;
                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                            <div style="background-color: #2563EB; padding: 20px; text-align: center;">
                                <h2 style="color: white; margin: 0;">New Task Assigned</h2>
                            </div>
                            <div style="padding: 20px; background-color: #ffffff;">
                                <p style="font-size: 16px; color: #374151;">Hello <b>${user.name}</b>,</p>
                                <p style="font-size: 16px; color: #374151;">A new task has been assigned to you by the Principal/Admin.</p>
                                
                                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0 0 10px 0;"><b>📁 Category:</b> ${category}</p>
                                    <p style="margin: 0 0 10px 0;"><b>📌 Task:</b> ${heading}</p>
                                    <p style="margin: 0 0 10px 0;"><b>📝 Description:</b> ${description || 'No additional details provided.'}</p>
                                    <p style="margin: 0; color: #DC2626;"><b>⏰ Due Date:</b> ${emailDueDate}</p>
                                </div>
                                
                                <p style="font-size: 14px; color: #6B7280;">Please log in to your GPS Task Manager dashboard to view any attachments and update your progress.</p>
                            </div>
                        </div>
                    `;
                    // Send email in the background
                    sendEmail(user.email, subject, htmlContent);
                }
            }
        } catch (emailErr) {
            console.error("Error triggering assignment emails:", emailErr);
        }

    } catch (err) {
        await connection.rollback();
        console.error("❌ CREATE TASK ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 2. GET TASKS
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status } = req.query;

        // ADDED 't.category' to the SELECT statement
        let query = `
            SELECT t.id, t.heading, t.category, t.description, t.end_date, 
                   ta.status, ta.assigned_at, ta.user_id as assigned_to_id, 
                   u1.name as assigned_by_name, 
                   u2.name as assigned_to_name, u2.department as assigned_to_dept
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            JOIN Users u1 ON t.assigned_by = u1.id
            JOIN Users u2 ON ta.user_id = u2.id
        `;
        let params = [];

        if (userRole !== 'admin') {
            query += ' WHERE ta.user_id = ?';
            params.push(userId);
        } else {
            query += ' WHERE 1=1';
        }

        if (status) {
            query += ' AND ta.status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.end_date ASC';

        const [tasks] = await db.query(query, params);
        res.json(tasks);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 3. UPDATE TASK STATUS
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        await db.query(
            'UPDATE TaskAssignments SET status = ? WHERE task_id = ? AND user_id = ?',
            [status, taskId, userId]
        );

        res.json({ message: "Status Updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. GET USER STATS
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const query = `
            SELECT t.end_date, ta.status 
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            WHERE ta.user_id = ?
        `;
        const [tasks] = await db.query(query, [userId]);

        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            near_deadline: tasks.filter(t => {
                const endDate = new Date(t.end_date);
                return t.status !== 'completed' && endDate > now && endDate < next48h;
            }).length
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. GET ATTACHMENTS
exports.getTaskAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const [files] = await db.query('SELECT * FROM Attachments WHERE related_id = ? AND related_to = "TASK"', [taskId]);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. GET ADMIN STATS (UPGRADED FOR VISUALIZATIONS)
exports.getAdminStats = async (req, res) => {
    try {
        const [userRows] = await db.query("SELECT COUNT(*) as count FROM Users WHERE role != 'admin'");
        const [activeRows] = await db.query("SELECT COUNT(*) as count FROM TaskAssignments WHERE status != 'completed'");
        const [overdueRows] = await db.query(`
            SELECT COUNT(*) as count 
            FROM TaskAssignments ta 
            JOIN Tasks t ON ta.task_id = t.id 
            WHERE t.end_date < NOW() AND ta.status != 'completed'
        `);

        // 1. Fetch tasks nearing deadline (Next 48 Hours)
        const [nearDeadlineTasks] = await db.query(`
            SELECT t.id, t.heading, t.category, t.end_date, u.name as assigned_to_name
            FROM TaskAssignments ta
            JOIN Tasks t ON ta.task_id = t.id
            JOIN Users u ON ta.user_id = u.id
            WHERE t.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 48 HOUR)
            AND ta.status != 'completed'
            ORDER BY t.end_date ASC
        `);

        // 2. Fetch Category-wise Stats
        const [categoryStats] = await db.query(`
            SELECT 
                t.category, 
                SUM(CASE WHEN ta.status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN ta.status != 'completed' THEN 1 ELSE 0 END) as incomplete
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            WHERE t.category IS NOT NULL
            GROUP BY t.category
        `);

        // 3. Fetch Sub-task (Heading) Stats
        const [subtaskStats] = await db.query(`
            SELECT 
                t.category, 
                t.heading as subtask,
                SUM(CASE WHEN ta.status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN ta.status != 'completed' THEN 1 ELSE 0 END) as incomplete
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            WHERE t.category IS NOT NULL
            GROUP BY t.category, t.heading
        `);

        res.json({
            total_users: userRows[0].count,
            active_tasks: activeRows[0].count,
            overdue_tasks: overdueRows[0].count,
            near_deadline: nearDeadlineTasks,
            category_stats: categoryStats,
            subtask_stats: subtaskStats
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 7. DELETE TASK (Updated to Delete Files from Supabase)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch file URLs associated with this task
        const [files] = await db.query(
            'SELECT file_url FROM Attachments WHERE related_id = ? AND related_to = "TASK"', 
            [id]
        );

        // 2. Delete files from Supabase Storage
        if (files.length > 0) {
            // Extract filenames from URLs
            // URL format: .../task-files/173..._filename.pdf
            const filePaths = files.map(f => {
                const parts = f.file_url.split('/task-files/');
                return parts.length > 1 ? parts[1] : null;
            }).filter(p => p !== null);

            if (filePaths.length > 0) {
                const { error } = await supabase.storage
                    .from('task-files')
                    .remove(filePaths);
                
                if (error) console.error("Supabase File Delete Error:", error);
                else console.log("Deleted files:", filePaths);
            }
        }

        // 3. Delete Task from DB (Cascade will remove Assignments & Attachments rows)
        await db.query('DELETE FROM Tasks WHERE id = ?', [id]);
        res.json({ message: "Task and associated files deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 8. UPDATE TASK DETAILS (Admin Only)
exports.updateTaskDetails = async (req, res) => {
    try {
        const { id } = req.params;
        // ADDED: Extract 'category' from req.body
        const { category, heading, description, end_date } = req.body;

        // Format date for MySQL
        const formattedDate = new Date(end_date).toISOString().slice(0, 19).replace('T', ' ');

        // ADDED: Update the 'category' column in the database
        await db.query(
            'UPDATE Tasks SET category=?, heading=?, description=?, end_date=? WHERE id=?',
            [category, heading, description, formattedDate, id]
        );

        res.json({ message: "Task Updated Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 9. DELETE ASSIGNMENT
exports.deleteTaskAssignment = async (req, res) => {
    try {
        const { taskId, userId } = req.params;
        await db.query(
            'DELETE FROM TaskAssignments WHERE task_id = ? AND user_id = ?', 
            [taskId, userId]
        );
        res.json({ message: "Task removed for this user" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 10. Send Reminder
// ==========================================
// SEND REMINDER (COMBINED: App DB Notification + Email)
// ==========================================
exports.sendReminder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { user_id, task_heading, task_category } = req.body; 
        const sender_id = req.user.id; 

        // ----------------------------------------------------
        // PART 1: Save App Notification to Database
        // ----------------------------------------------------
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

        // Commit the DB transaction immediately so the user gets the in-app notification
        await connection.commit();

        // ----------------------------------------------------
        // PART 2: Send the Email Notification
        // ----------------------------------------------------
        // Fetch the user's email & name
        const [users] = await db.query('SELECT name, email FROM Users WHERE id = ?', [user_id]);
        
        let emailSent = false;

        if (users.length > 0 && users[0].email) {
            const user = users[0];
            const subject = `⚠️ URGENT REMINDER: Task Overdue / Due Soon`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #EA580C; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Action Required: Task Reminder</h2>
                    </div>
                    <div style="padding: 20px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #374151;">Hello <b>${user.name}</b>,</p>
                        <p style="font-size: 16px; color: #374151;">This is a reminder from the Principal regarding an incomplete task assigned to you.</p>
                        
                        <div style="background-color: #FFF7ED; border-left: 4px solid #EA580C; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0 0 5px 0;"><b>Category:</b> ${task_category || 'N/A'}</p>
                            <p style="margin: 0;"><b>Task:</b> ${task_heading}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #DC2626; font-weight: bold;">Please log in to the dashboard immediately to complete this task and update its status.</p>
                    </div>
                </div>
            `;

            // Send Email
            emailSent = await sendEmail(user.email, subject, htmlContent);
        }

        // Return a smart response depending on if they had an email or not
        if (emailSent) {
            res.json({ message: "App Notification AND Email sent successfully!" });
        } else {
            res.json({ message: "App Notification sent! (No email configured for this user)" });
        }

    } catch (err) {
        await connection.rollback();
        console.error("Reminder Error:", err); 
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};