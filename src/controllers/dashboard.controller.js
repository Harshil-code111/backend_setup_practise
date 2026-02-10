import mongoose,{isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params;
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }
    const channelExists = await User.exists({ _id: channelId });
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const dashboardStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: "$owner",
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalVideos: 1,
            }
        },

    ])
    //   Subscribers (channel-level)
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    // Likes (channel-level)
    const videoIds = await Video.find({ owner: channelId }).distinct("_id");

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });
    const stats = dashboardStats[0] || { totalViews: 0, totalVideos: 0 };
    return res
        .status(200)
        .json(new ApiResponse(200, { data: { ...stats, totalSubscribers, totalLikes } }, "channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params;
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
        
    }

    const allVideos = await Video.find({ owner: channelId }).select("_id title createdAt").sort({ createdAt: -1 });


    // const dashboardStats =await Video.aggregate([
    //     {
    //         $match: {
    //             owner: new mongoose.Types.ObjectId(channelId)
    //         }
    //     },
    //     {
    //         $project:{
    //             _id:1,
    //             title:1,
    //             owner:1,
    //              createdAt:1
    //         }

    //     }
    // ])

    return res
        .status(200)
        .json(new ApiResponse(200, { data: allVideos }, "channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}