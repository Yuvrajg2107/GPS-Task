const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        
        // Check if the file is an image (png, jpg, jpeg, gif, etc.)
        const isImage = file.mimetype.startsWith('image/');

        return {
            folder: 'task-manager-uploads',
            
            // CRITICAL FIX: 
            // If it's an image, use 'image'. For PDF, Word, Excel, PPT, use 'raw'.
            resource_type: isImage ? 'image' : 'raw', 
            
            // Keep the original filename + current time to avoid duplicates
            // We append the extension manually for 'raw' files so they download correctly
            public_id: file.originalname.split('.')[0] + "_" + Date.now(),
            
            // 'format' ensures images get the right extension. 
            // For 'raw' files, we leave it undefined (Cloudinary uses the upload content).
            format: isImage ? undefined : file.originalname.split('.').pop()
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;