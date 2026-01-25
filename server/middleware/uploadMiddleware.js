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
        
        // 1. Check if it is strictly an image file (jpg, png, etc.)
        const isImage = file.mimetype.startsWith('image/');
        
        // 2. Prepare the filename
        // Clean special characters to prevent URL issues
        const fileExtension = file.originalname.split('.').pop();
        const fileNameBase = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueSuffix = Date.now();

        // 3. Logic
        if (isImage) {
            // Images: Use 'image' resource_type so Cloudinary can resize/optimize them
            return {
                folder: 'task-manager-uploads',
                resource_type: 'image', 
                public_id: `${fileNameBase}_${uniqueSuffix}`,
            };
        } else {
            // PDFs, Docs, Excel: Use 'raw' resource_type.
            // This prevents Cloudinary from trying to "process" the PDF, which was causing the crash.
            // CRITICAL: We MUST manually add the extension (e.g., .pdf) to the public_id here.
            return {
                folder: 'task-manager-uploads',
                resource_type: 'raw', 
                public_id: `${fileNameBase}_${uniqueSuffix}.${fileExtension}`,
                format: undefined // Raw files don't use the format parameter
            };
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;