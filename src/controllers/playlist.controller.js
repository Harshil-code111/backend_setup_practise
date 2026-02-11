import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id

    //TODO: create playlist
    if (!name || name.trim() === "" || !description || description.trim() === "") {
        throw new ApiError(400, "Name and description are required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })
    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const userPlaylist = (await Playlist.find({ owner: userId })).sort({ createdAt: -1 })
    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylist, "User playlists retrieved successfully"));


})

const getPlaylistById = asyncHandler(async (req, res) => {
    //     const { playlistId, userId } = req.params;
    //     const { page = 1, limit = 10 } = req.query;
    //     //TODO: get playlist by id
    //     if (!playlistId || !isValidObjectId(playlistId)) {
    //         throw new ApiError(400, "Invalid playlist ID")
    //     }
    //     const pageNum = parseInt(page);
    //     const limitNum = parseInt(limit)

    //     const playlist = await Playlist.find({ owner: userId })
    //         .populate("videos", "title thumbnail duration")
    //         .skip((pageNum - 1) * limitNum)
    //         .limit(limitNum)
    //         .sort({ createdAt: -1 });
    //     const total = await Playlist.countDocuments({ owner: userId });

    //     if (!playlist) {
    //         throw new ApiError(404, "Playlist not found")
    //     }
    //     return res
    //         .status(200)
    //         .json(new ApiResponse(200, { playlist, total }, "Playlist retrieved successfully"))
    //

    const { playlistId, userId } = req.params;
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId })
        .populate("videos", "title thumbnail duration")
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // TODO: add video in playlist
    const { playlistId, videoId } = req.params
    if (!playlistId || !isValidObjectId(playlistId) || !videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or videoId")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }


    // Adding video to playlist


    // playlist.videos.push(videoId)
    const addedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true }
    )
    if (!addedVideo) {
        throw new ApiError(400, "Video is not added to playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, addedVideo, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId || !isValidObjectId(playlistId) || !videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or videoId")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video not found")
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    // Removing video from playlist
    const deletedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    )
    if (!deletedVideo) {
        throw new ApiError(400, "Video is not deleted from playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video removed from playlist successfully"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    await Playlist.findByIdAndDelete(playlistId)
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if (!name || name.trim() === "" || !description || description.trim() === "") {
        throw new ApiError(400, "Name and description are required")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        { new: true }
    )
    if (!updatedPlaylist) {
        throw new ApiError(400, "Playlist is not updated")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}