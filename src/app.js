import express from "express"
import cookieparser from "cookie-parser"
import cors from "cors"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser())


//routes import 

import userRouter from "./routes/user.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import likeRouter from "./routes/like.routes.js"
import tweetRouter from ".routs/tweet.routes.js"



//routes use
app.use("/api/v1/users",userRouter)
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/tweet",tweetRouter)


export { app };