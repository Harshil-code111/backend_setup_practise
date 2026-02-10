import {Router} from "express"
import { getVideoComments,addComment,updateComment,deleteComment } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/video/:videoId").get(getVideoComments)


router.route("/video/:videoId")
    .post(verifyJWT, addComment)
router.route("/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment);


export default router