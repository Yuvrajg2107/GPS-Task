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

// 2. Configure Storage Engine with Dynamic Resource Type
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Check file mimetype to determine correct resource_type
        const isRaw = file.mimetype.includes('pdf') || 
                      file.mimetype.includes('document') || 
                      file.mimetype.includes('text');

        return {
            folder: 'task-manager-uploads',
            // 'raw' keeps PDFs/Docs as original files. 'image' optimizes photos.
            resource_type: isRaw ? 'raw' : 'image', 
            // Keep original filename to prevent "unnamed" downloads
            public_id: file.originalname.split('.')[0], 
            // Use original extension for raw files to ensure browser recognizes them
            format: isRaw ? undefined : file.mimetype.split('/')[1] 
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;