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
        // 1. Check if it is an image
        const isImage = file.mimetype.startsWith('image/');
        
        // 2. Get the extension (e.g., 'pdf')
        const fileExtension = file.originalname.split('.').pop();
        // 3. Get the name without extension
        const fileNameBase = file.originalname.replace(/\.[^/.]+$/, "");

        return {
            folder: 'task-manager-uploads',
            
            // CRITICAL FIX: Explicitly add extension for RAW files
            public_id: isImage 
                ? `${fileNameBase}_${Date.now()}` 
                : `${fileNameBase}_${Date.now()}.${fileExtension}`,
            
            resource_type: isImage ? 'image' : 'raw',
            
            // Format is not needed if we added extension to public_id
            format: undefined 
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;