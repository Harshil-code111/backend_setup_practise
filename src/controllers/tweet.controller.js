import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //own tweet so req.user._id which is coming from verifyJWT middleware which is currently logged in user 
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });


    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    //TODO: get user tweets
    //to target specific user tweets we will use userId as params and find all tweets with that userId as owner
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",//mongodb converts model name into lowercase and plurel form
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                ownerDetails: {
                    _id: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }

    ])

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }
    if (!isValidObjectId(req.params.tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        { _id: req.params.tweetId, owner: req.user._id },
        { content: content.trim() },
        { new: true }
    );
    
    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    if (!isValidObjectId(req.params.tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const deletedTweet = await Tweet.findOneAndDelete({
        _id: req.params.tweetId,
        owner: req.user._id
    });
    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}