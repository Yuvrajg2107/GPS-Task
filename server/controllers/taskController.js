const db = require('../db');

// 1. CREATE TASK (Admin Only)
exports.createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        console.log("📥 Received Task Data:", req.body);

        const { heading, description, end_date, assigned_to } = req.body;
        const assigned_by = req.user.id;
        const files = req.files || []; 

        if (!heading || !assigned_to) {
            throw new Error("Missing Heading or Assigned Users");
        }

        let assignedUserIds;
        try {
            assignedUserIds = JSON.parse(assigned_to);
        } catch (e) {
            throw new Error("Invalid assigned_to format. Expected JSON array.");
        }

        if (assignedUserIds.length === 0) {
            throw new Error("No users selected for assignment.");
        }

        // --- DATE FIXES ---
        // 1. Format End Date
        const formattedEndDate = new Date(end_date).toISOString().slice(0, 19).replace('T', ' ');
        
        // 2. Create Start Date (Current Time)
        const now = new Date();
        const formattedStartDate = now.toISOString().slice(0, 19).replace('T', ' ');

        // Step 1: Insert Task Details
        const [taskResult] = await connection.query(
            'INSERT INTO Tasks (heading, description, assigned_by, end_date) VALUES (?, ?, ?, ?)',
            [heading, description, assigned_by, formattedEndDate]
        );
        const taskId = taskResult.insertId;
        console.log("✅ Task Created with ID:", taskId);

        // Step 2: Assign to Users (Bulk Insert with Start Date)
        const assignmentValues = assignedUserIds.map(userId => [
            taskId, 
            userId, 
            'viewed', 
            formattedStartDate 
        ]);

        await connection.query(
            'INSERT INTO TaskAssignments (task_id, user_id, status, assigned_at) VALUES ?',
            [assignmentValues]
        );
        console.log("✅ Users Assigned with Start Date");

        // Step 3: Save File Info (If files exist)
        if (files.length > 0) {
            const fileValues = files.map(file => [taskId, 'TASK', file.path, file.mimetype]);
            await connection.query(
                'INSERT INTO Attachments (related_id, related_to, file_url, file_type) VALUES ?',
                [fileValues]
            );
            console.log("✅ Files Attached:", files.length);
        }

        await connection.commit();
        res.status(201).json({ message: "Task Assigned Successfully!" });

    } catch (err) {
        await connection.rollback();
        console.error("❌ CREATE TASK ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 2. GET TASKS (Updated to SELECT assigned_at)
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status } = req.query;

        // FIX IS HERE: Added 'ta.assigned_at' to the SELECT list
        let query = `
            SELECT t.id, t.heading, t.description, t.end_date, 
                   ta.status, ta.assigned_at, ta.user_id as assigned_to_id, 
                   u1.name as assigned_by_name, 
                   u2.name as assigned_to_name, u2.department as assigned_to_dept
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            JOIN Users u1 ON t.assigned_by = u1.id
            JOIN Users u2 ON ta.user_id = u2.id
        `;
        let params = [];

        // If User: Show ONLY their tasks
        if (userRole !== 'admin') {
            query += ' WHERE ta.user_id = ?';
            params.push(userId);
        } else {
            query += ' WHERE 1=1'; // Admin sees all
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

// 4. GET USER DASHBOARD STATS
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

        // Get all tasks for this user
        const query = `
            SELECT t.end_date, ta.status 
            FROM Tasks t
            JOIN TaskAssignments ta ON t.id = ta.task_id
            WHERE ta.user_id = ?
        `;
        const [tasks] = await db.query(query, [userId]);

        // Calculate Counts
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

exports.getTaskAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const [files] = await db.query('SELECT * FROM Attachments WHERE related_id = ? AND related_to = "TASK"', [taskId]);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. GET ADMIN DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
    try {
        // 1. Count Total Users (excluding admins)
        const [userRows] = await db.query("SELECT COUNT(*) as count FROM Users WHERE role != 'admin'");
        
        // 2. Count Active Tasks (Status is NOT completed)
        const [activeRows] = await db.query("SELECT COUNT(*) as count FROM TaskAssignments WHERE status != 'completed'");

        // 3. Count Overdue Tasks (End date passed AND not completed)
        const [overdueRows] = await db.query(`
            SELECT COUNT(*) as count 
            FROM TaskAssignments ta 
            JOIN Tasks t ON ta.task_id = t.id 
            WHERE t.end_date < NOW() AND ta.status != 'completed'
        `);

        res.json({
            total_users: userRows[0].count,
            active_tasks: activeRows[0].count,
            overdue_tasks: overdueRows[0].count
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};