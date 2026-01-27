import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import express from "express";
// import mongoose from "mongoose";
// import { DB_NAME } from "../../constants.js";
import { connectDB } from "./db/index.js";  
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed",error)
})


/*


(async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("error is connecting to db")
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`server is running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("error", error)
        throw error
    }
})()
*/