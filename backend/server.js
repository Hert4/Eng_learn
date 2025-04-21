import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/mongodb.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
dotenv.config()

const app = express()
connectDB()
const PORT = process.env.PORT || 5000

// middleware simple just a function run between request and response
app.use(express.json()); // parse json data in the req.body
app.use(express.urlencoded({ extended: true })); // parse form data in the req.body
app.use(cookieParser()); // parse cookies in the req.headers


//Routes
app.use('/api/users', userRoutes)
app.listen(5000, () => console.log(`Server start at http://localhost:${PORT}`))