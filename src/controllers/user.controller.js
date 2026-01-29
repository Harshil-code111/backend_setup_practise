import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";



const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;  //update userschema regreshtoken from null to real refreshtoken in memeory not in db
        await user.save({ validateBeforeSave: false }) //save refreshtoken in db permanent validateBeforeSave--> understand that we are not validating other fields except refreshtoken

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}
const registerUser = asyncHandler(async (req, res) => {

    //get user data from frontend
    //validation-not empty
    //check user already exists:username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object to store db(due to mongo is non sequential, we can create id here)-use crteate-method
    //remove password and refresh token from response
    //check for user creation
    //send response


    const { username, email, password, fullName } = req.body
    //console.log(req.body);

    if ([username, email, password, fullName].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]

    })
    console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User already exists with this username or email")
    }

    const avtarLocalPath = req.files?.avatar[0]?.path;
    console.log("Avatar path:", avtarLocalPath);

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    console.log("Cover image path:", coverImageLocalPath);

    if (!avtarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        password
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
    //get data-->req.body
    //validation based on username or email
    //find user in database
    //password checking
    //access and refresh token
    //send cookie
    
    const { username, email, password } = req.body
    
    if (!username && !email) {
        throw new ApiError(400, "Username and email is required")
    }

const user = await User.findOne({
    $or: [{ username }, { email }]
})
if (!user) {
    throw new ApiError(400, "User does not exist")
}

const isPasswordValid = await user.isCorrectPassword(password)

if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
}

const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id)



const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
    httpOnly: true,
    secure: true
} 

return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully"
    )
)

})

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            } 
        },
        {
            new:true
        }
     )
     const options = {
    httpOnly: true,
    secure: true
} 
 return res
    .status(200)
    .clearCookie("accessToken", "", { ...options })
    .clearCookie("refreshToken", "", { ...options})
    .json(
        new ApiResponse(200,null,"User Logged Out Successfully")
    )
    })
export {
    registerUser,
    loginUser,
    logoutUser
}  