const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        
        // 1. Determine File Type
        const isImage = file.mimetype.startsWith('image/');
        const isPdf = file.mimetype === 'application/pdf';
        
        // Clean filename: remove extension and special characters
        const fileNameBase = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueSuffix = Date.now();

        // 2. CONFIGURATION LOGIC
        if (isImage || isPdf) {
            // CRITICAL FIX: Treat PDF as 'image' so Cloudinary processes it as a document.
            // This enables Previews and proper "View in Browser" functionality.
            return {
                folder: 'task-manager-uploads',
                resource_type: 'image', 
                public_id: `${fileNameBase}_${uniqueSuffix}`,
                // For PDFs, we explicitly ask for 'pdf' format to ensure it doesn't convert to jpg
                format: isPdf ? 'pdf' : undefined 
            };
        } 
        else {
            // Word, Excel, Zip -> Keep as 'raw' to avoid corruption
            // Must manually append extension for raw files
            const ext = file.originalname.split('.').pop();
            return {
                folder: 'task-manager-uploads',
                resource_type: 'raw',
                public_id: `${fileNameBase}_${uniqueSuffix}.${ext}`,
            };
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;