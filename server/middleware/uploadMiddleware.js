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
        
        // Smart Type Detection
        // Images AND PDFs should be 'auto' so Cloudinary can display them.
        // Word/Excel/Zip must be 'raw' to prevent corruption.
        const isAuto = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
        
        // Prepare Filename
        const fileExtension = file.originalname.split('.').pop();
        const fileNameBase = file.originalname.replace(/\.[^/.]+$/, "");
        const uniqueSuffix = Date.now();

        if (isAuto) {
            return {
                folder: 'task-manager-uploads',
                resource_type: 'auto', // Cloudinary detects PDF/Image automatically
                public_id: `${fileNameBase}_${uniqueSuffix}`, // Cloudinary ADDS extension automatically here
            };
        } else {
            return {
                folder: 'task-manager-uploads',
                resource_type: 'raw', // Treat Word/Excel as raw files
                public_id: `${fileNameBase}_${uniqueSuffix}.${fileExtension}`, // Manually ADD extension for Raw
                format: undefined
            };
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;