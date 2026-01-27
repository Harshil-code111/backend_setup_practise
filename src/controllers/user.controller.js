import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary }   from "../utils/cloudinary.js";
import { ApiResponse }  from "../utils/apiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{

//get user data from frontend
//validation-not empty
//check user already exists:userName,email
//check for images,check for avatar
//upload them to cloudinary,avatar
//create user object to store db(due to mongo is non sequential, we can create id here)-use crteate-method
//remove password and refresh token from response
//check for user creation
//send response


const{userName,email,password,fullName}=req.body
//console.log(req.body);

if ([userName, email, password, fullName].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
}


const existedUser=await User.findOne({
    $or:[{userName},{email}]
    
})
console.log(existedUser);
if(existedUser){
    throw new ApiError(409,"User already exists with this userName or email")       
}

const avtarLocalPath= req.files?.avatar[0]?.path;
console.log("Avatar path:", avtarLocalPath);

let coverImageLocalPath;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
     coverImageLocalPath= req.files?.coverImage[0]?.path;
}
console.log("Cover image path:", coverImageLocalPath);

if(!avtarLocalPath){
    throw new ApiError(400,"Avatar image is required")  
}

const avatar=await uploadOnCloudinary(avtarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(500,"Failed to upload avatar image")
}

const user=await User.create({
    username:userName.toLowerCase(),
    email,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    fullName,
    password
})
const createdUser=await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500,"Failed to create user")
}

return res.status(201).json(new ApiResponse(201,createdUser,"User registered successfully"))

})

export {registerUser}  