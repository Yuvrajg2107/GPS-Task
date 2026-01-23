const db = require('./db');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
    try {
        const phone = '9999999999';
        const newPassword = '12345';

        // 1. Hash the password correctly using your library
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log("Generated Hash:", hashedPassword);

        // 2. Update the user in the database
        const [result] = await db.query(
            'UPDATE Users SET password_hash = ? WHERE phone_number = ?',
            [hashedPassword, phone]
        );

        if (result.affectedRows > 0) {
            console.log("✅ Success! Admin password reset to: 12345");
        } else {
            console.log("❌ Error: Admin user not found. Checking if we need to create it...");
            // Optional: Create if doesn't exist
            await db.query(
                "INSERT INTO Users (name, phone_number, password_hash, role, department, gender) VALUES ('Super Admin', ?, ?, 'admin', 'ALL', 'Male')",
                [phone, hashedPassword]
            );
            console.log("✅ Created new Admin user with password: 12345");
        }

        process.exit();

    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

resetAdmin();