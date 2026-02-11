import { Router } from "express";
import {createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,
    removeVideoFromPlaylist,deletePlaylist,updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { app } from "../app.js";

const router = Router();

router.use(verifyJWT)


router.route("/").post(createPlaylist).get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist).put(updatePlaylist)
router.route("/:playlistId/videos").post(addVideoToPlaylist)
router.route("/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist)

export default router