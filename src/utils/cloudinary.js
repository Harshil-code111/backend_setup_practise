import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const removeLocalFile = async (filePath) => {
    if (!filePath) return
    try {
        await fs.promises.unlink(filePath)
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove local file:", filePath, error.message)
        }
    }
}

const uploadOnCloudinary = async (localfilePath, resourceType = "auto") => {
    try {
        // Configure Cloudinary inside the function to ensure env vars are loaded
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });
        
        if (!localfilePath) return null
        const response = await cloudinary.uploader.upload(localfilePath, {
            folder: 'Set_UP',
            resource_type: resourceType
        })
        await removeLocalFile(localfilePath)
        console.log('Upload Successful');
        return {
            url: response.secure_url || response.url,
            secureUrl: response.secure_url || response.url,
            public_id: response.public_id,
            duration: response.duration
        };
    } catch (error) {
        await removeLocalFile(localfilePath)
        
        console.log('Upload to Cloudinary failed:', error.message);
        console.error('Error details:', error);
        return null
    }
}

    export { uploadOnCloudinary };