import express from "express"
import {
    signupUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUser
  } from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js"



const router = express.Router()

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile/:query", getUserProfile)
router.put("/update/:id",protectRoute, updateUser)

export default router