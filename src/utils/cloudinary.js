import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
    const uploadOnCloudinary = async (localfilePath) => {
        try {
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
            fs.unlinkSync(localfilePath);//remove file from local storage
            console.log('Upload to Cloudinary failed');
            return null
        }
    }

    export { uploadOnCloudinary };