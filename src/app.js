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

//routes use
app.use("/api/v1/users",userRouter)



export { app };