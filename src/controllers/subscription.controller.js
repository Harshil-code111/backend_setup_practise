import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!channelId?.trim() || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }
    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })
    // if subscription exists, delete it
    if (existingSubscription) {

        await existingSubscription.deleteOne()

        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "Subscription canceled successfully"))
    }
    // else create a new subscription

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully"))

})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    if (pageNum <= 0 || limitNum <= 0) {
    throw new ApiError(400, "page and limit should be positive integers");
}


    if (!channelId?.trim() || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name avatar")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, { count: subscribers.length, subscribers }, "Subscribers fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params._id.toString()
    
    if (subscriberId !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to view this data")
    }

    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    if (!subscriberId?.trim() || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name avatar")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, { count: channels.length, channels }, "Subscribed channels fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}