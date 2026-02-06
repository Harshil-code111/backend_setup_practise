import { Router }  from "express";
import { toggleCommentLike,toggleTweetLike,toggleVideoLike,getLikedVideos} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/video/:videoId").post(toggleVideoLike);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router
