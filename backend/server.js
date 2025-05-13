import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/mongodb.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import fs from 'fs/promises';
import swaggerUi from "swagger-ui-express"
import cors from 'cors';

async function loadSwagger() {
    const data = await fs.readFile('./swagger/swagger.json', 'utf8'); // Đọc file  
    return JSON.parse(data);
}

dotenv.config()

const app = express()


app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true

}));

connectDB()
const PORT = process.env.PORT || 5000

// middleware simple just a function run between request and response
app.use(express.json()); // parse json data in the req.body
app.use(express.urlencoded({ extended: true })); // parse form data in the req.body
app.use(cookieParser()); // parse cookies in the req.headers
loadSwagger().then(swaggerDocument => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
})


//Routes
app.use('/api/users', userRoutes)
app.listen(5000, () => console.log(`Server start at http://localhost:${PORT}`))