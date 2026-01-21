import mongoose from "mongoose"
import { DB_NAME }   from "../../constants.js"

export const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb connected sucessfully!! DB Host:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongodb connection FAILED!!!!!!");
        process.exit(1)
    }
}