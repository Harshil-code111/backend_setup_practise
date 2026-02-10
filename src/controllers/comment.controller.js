import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    if (!videoId?.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400, " Invalid videoId ")
    }
    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if (pageNum <= 0 || limitNum <= 0) {
        throw new ApiError(400, "page and limit should be positive integers")
    }

    const allComments = await Comment.find({ video: videoId })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("owner", "name profilePic")
        .sort({ createdAt: -1 })
    return res
        .status(200)
        .json(new ApiResponse(200, { data: allComments }, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const { videoId } = req.params
    if (!videoId?.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400, " Invalid videoId ")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, " Invalid content for comment   ")
    }
  

    if (content.length > 1000) {
    throw new ApiError(400, "Comment too long")
}
    const comment = await Comment.create({
        content: content.trim(),
        owner: req.user._id,
        video: videoId
    })

    if (!comment) {
        throw new ApiError(500, "Failed to add comment")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params
    if (!commentId?.trim() || !isValidObjectId(commentId)) {
        throw new ApiError(400, " Invalid commentId ")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "content is required")
    }
    if (content.length > 1000) {
    throw new ApiError(400, "Comment too long")
}
    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id,
        },
        {
            content: content.trim()
        },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    if (!commentId?.trim() || !isValidObjectId(commentId)) {
        throw new ApiError(400, " Invalid commentId ")
    }

    const deletedComment = await Comment.findOneAndDelete({

        _id: commentId,
        owner: req.user._id,
    });

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}