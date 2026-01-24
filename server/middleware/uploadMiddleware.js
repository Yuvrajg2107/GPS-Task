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
    params: {
        folder: 'task-manager-uploads', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt'],
        resource_type: 'auto' // Auto-detects image vs raw file (pdf/docs)
    },
});

const upload = multer({ storage: storage });

module.exports = upload;