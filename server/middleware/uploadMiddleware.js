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
        
        // 1. Check if it's an image
        const isImage = file.mimetype.startsWith('image/');
        
        // 2. Get the file extension (e.g., "pdf", "docx")
        const fileExtension = file.originalname.split('.').pop();
        // Get the name without extension (e.g., "report")
        const fileNameBase = file.originalname.replace(/\.[^/.]+$/, ""); 

        return {
            folder: 'task-manager-uploads',
            
            // 3. Set Resource Type
            resource_type: isImage ? 'image' : 'raw', 
            
            // 4. CRITICAL FIX: Manually append extension for Raw files
            // If it's a PDF/Doc, we MUST add "." + extension to the ID.
            // If it's an Image, Cloudinary handles it automatically.
            public_id: isImage 
                ? `${fileNameBase}_${Date.now()}` 
                : `${fileNameBase}_${Date.now()}.${fileExtension}`,
            
            // Format is not needed for raw files if public_id has the extension
            format: undefined
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;