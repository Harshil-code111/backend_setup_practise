import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }
    const userId = req.user._id;

    const existingLikeVideo = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLikeVideo) {
        await existingLikeVideo.deleteOne({ _id: existingLikeVideo._id });

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, 'Video unliked successfully'));
    }

    await Like.create({
        video: videoId,
        likedBy: userId
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true }, 'Video liked successfully'));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const userId = req.user._id;

    const existingLikeComment = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLikeComment) {
        await existingLikeComment.deleteOne({ _id: existingLikeComment._id })

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"))
    }

    await Like.create({
        comment: commentId,
        likedBy: userId

    })
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const userId = req.user._id
    const existingLikeTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: userId

    })
    if (existingLikeTweet) {
        await existingLikeTweet.deleteOne({ _id: existingLikeTweet._id })

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: userId
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true }, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",//mongodb converts model name into lowercase and purel form
                localField: "video",
                foreignField: "_id",
                as: "likedVideo"
            }
        },
        {
            $unwind: "$likedVideo"
        },
        
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}