const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// 1. Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 2. Configure Multer to store file in Memory (RAM) temporarily
// We need the buffer to upload to Supabase manually
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 3. Custom Middleware to Upload to Supabase
const uploadToSupabase = async (req, res, next) => {
    // If no files were uploaded, skip to the next middleware (Controller)
    if (!req.files || req.files.length === 0) return next();

    try {
        const uploadPromises = req.files.map(async (file) => {
            // Create a unique filename (e.g., 17654321_my_report.pdf)
            // We sanitize the name to remove spaces or special characters
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
            const fileName = `${Date.now()}_${sanitizedName}`;

            // Upload to Supabase Bucket (Ensure you created a bucket named 'task-files')
            const { data, error } = await supabase.storage
                .from('task-files') // Make sure this matches your Bucket Name in Supabase
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype, // CRITICAL: This ensures PDF opens as PDF, Image as Image
                    upsert: false
                });

            if (error) {
                console.error("Supabase Storage Error:", error);
                throw new Error("Failed to upload to storage");
            }

            // Get the Public URL
            const { data: publicData } = supabase.storage
                .from('task-files')
                .getPublicUrl(fileName);

            // CRITICAL STEP:
            // We attach the Supabase URL to the file object as 'path'.
            // This ensures your existing Controllers work without changing their code!
            file.path = publicData.publicUrl;
        });

        // Wait for all uploads to finish
        await Promise.all(uploadPromises);
        
        next(); // Proceed to the Controller
    } catch (error) {
        console.error("Upload Middleware Error:", error);
        res.status(500).json({ error: "Failed to upload files" });
    }
};

// Export both the Multer config AND the specific upload middleware
module.exports = { upload, uploadToSupabase };