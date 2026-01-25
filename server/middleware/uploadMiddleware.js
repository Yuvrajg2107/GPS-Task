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
        
        // 1. Identify if it is an image
        const isImage = file.mimetype.startsWith('image/');
        
        // 2. Extract extension and clean filename
        const fileExtension = file.originalname.split('.').pop();
        // Remove existing extension from name to avoid duplication (e.g. file.pdf.pdf)
        const fileNameBase = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");

        const uniqueSuffix = Date.now();

        if (isImage) {
            return {
                folder: 'task-manager-uploads',
                resource_type: 'image', // Cloudinary optimizes images
                public_id: `${fileNameBase}_${uniqueSuffix}`,
            };
        } else {
            return {
                folder: 'task-manager-uploads',
                resource_type: 'raw', // Treat PDF/Docs as raw to prevent corruption
                // CRITICAL FIX: Manually append the extension for raw files
                public_id: `${fileNameBase}_${uniqueSuffix}.${fileExtension}`, 
            };
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;