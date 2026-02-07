import {Router} from "express"
import {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels } from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router()

router.use(verifyJWT)

router.route("/subscribe/:channelId").post(toggleSubscription)
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/subscriptions").get(getSubscribedChannels)   

export default router