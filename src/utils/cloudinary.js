import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localfilePath) => {
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
            resource_type: 'auto' // jpeg, png
        })
        console.log('Upload Successful');
        return {
            url: response.url,
            public_id: response.public_id
        };
    } catch (error) {
        fs.unlinkSync(localfilePath);
        
        console.log('Upload to Cloudinary failed:', error.message);
        console.error('Error details:', error);
        return null
    }
}

    export { uploadOnCloudinary };