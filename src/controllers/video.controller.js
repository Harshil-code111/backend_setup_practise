import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if (pageNum <= 0 || limitNum <= 0) {
        throw new ApiError(400, "page and limit should be positive integers")
    }

    //  start with empty filter
    const filter = {}

    //  if userId is provided, filter by owner
    if (userId) {
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid userId")
        }
        filter.owner = userId
    }

    //  search by title
    if (query && query.trim() !== "") {
        filter.title = { $regex: query, $options: "i" }
    }

    //  public users see only published videos
    filter.isPublished = true

    // sorting
    const sortOptions = {}
    if (sortBy) {
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1
    } else {
        sortOptions.createdAt = -1
    }

    const videos = await Video.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort(sortOptions)
        .populate("owner", "name avatar")

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: videos, total: totalVideos },
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || title.trim() === "") {
        throw new ApiError(400, "title  is required")
    }
    if (title.trim().length > 100) {
        throw new ApiError(400, "title should be less than 100 characters")
    }
    if (description && description.trim().length > 500) {
        throw new ApiError(400, "description should be less than 500 characters")
    }
    if (!req.files || !req.files.videoFile?.[0] || !req.files.thumbnail?.[0]) {
        throw new ApiError(400, "video file and thumbnail are required")
    }
    const videoFile = req.files.videoFile[0]
    const thumbnail = req.files.thumbnail[0]


    // upload video and thumbnail on cloudinary and get the urls
    const uploadedVideo = await uploadOnCloudinary(videoFile.path, "video")
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path, "image")

    if (!uploadedVideo.secureUrl || !uploadedThumbnail.secureUrl) {
        throw new ApiError(500, "Error uploading video or thumbnail")
    }

    // create video document in db

    const video = await Video.create({
        title: title.trim(),
        description: description?.trim(),
        videoFile: uploadedVideo.secureUrl,
        thumbnail: uploadedThumbnail.secureUrl,
        owner: req.user._id,
        duration: uploadedVideo.duration
    })
    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is required and should be a valid ObjectId")
    }
    const video = await Video.findOne({
        _id: videoId,

        $or:[
            { isPublished: true },
            { owner: req.user?._id }
        ]
    }).populate("owner", "name avatar")


    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is required and should be a valid ObjectId")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }
    const { title, description } = req.body
    if (title && title.trim() !== "") {
        if (title.trim().length > 100) {
            throw new ApiError(400, "title should be less than 100 characters")
        }
        video.title = title.trim()
    }
    if (description && description.trim() !== "") {
        if (description.trim().length > 500) {
            throw new ApiError(400, "description should be less than 500 characters")
        }
        video.description = description.trim()
    }
    if (req.files && req.files.thumbnail?.[0]) {
        const thumbnail = req.files.thumbnail[0]
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path, "image")
        if (!uploadedThumbnail.secureUrl) {
            throw new ApiError(500, "Error uploading thumbnail")
        }
        video.thumbnail = uploadedThumbnail.secureUrl
    }
    await video.save()
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is required and should be a valid ObjectId")
    }

    const deletedVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    })
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to delete this video")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is required and should be a valid ObjectId")
    }
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    })
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: video.isPublished }, `Video ${video.isPublished ? "Published" : "Unpublished"} Successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}