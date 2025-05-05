import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import mongoose from "mongoose";

import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";

const signupUser = async (req, res) => {
    try {
      const { email, username, password } = req.body; //express json allow to do this
      if (!email || !username || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
      }
  
      const user = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      if (newUser) {
        generateTokenAndSetCookie(newUser._id, res);
        res.status(201).json({
          _id: newUser._id, //this is the id that mongoDB automatically creates
          email: newUser.email,
          username: newUser.username,
          profilePic: newUser.profilePic
        });
      } else {
        res.status(400).json({
          error: "Invalid user data",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log("Error in signupUser: ", error.message);
    }
};

//login user
const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findOne({
            $or: [{ username: username }, { email: email }]
    });
    
    // Check if user exists and password matches
    const isPasswordCorrect =
        user && (await bcrypt.compare(password, user.password));
        
    if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    // Send response 
    res.status(200).json({
        _id: user._id,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic
    });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};
    
const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in logoutUser: ", error.message);
    }
};

const getUserProfile = async(req, res) => {
    const {query} = req.params //username
    try{
      let user
      if (mongoose.Types.ObjectId.isValid(query)){
        user = await User.findOne({_id: query}).select("-password").select("-updateAt")
      }
      else{
        user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
      }
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user)
    }catch(error){

      res.status(500).json({error: error.message})
    }
}

const updateUser = async(req, res) => {
    const {username, email, currentPassword, newPassword} = req.body
    const userId = req.user._id
    // console.log(username)
    // console.log(email)
    // console.log(currentPassword)
    // console.log(newPassword)
    try {
        let user = await User.findById(userId)
        if(!user) return res.status(404).json({error: "User not found"})
        
        //start handle pwd
        console.log("New pwd", newPassword)
        
        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword.toString(), user.password)
          
            if(!isMatch) {
              res.status(401).json({
                error: "Your current password is wrong !"
              })
              return
            }
    
            if (newPassword){
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(newPassword.toString(), salt);
              user.password = hashedPassword
            }
        }
        
        // for profile updated
        user.email = email || user?.email
        user.username = username || user?.username

        //save to db
        user = await user.save()
        user.password = null

        res.status(200).json(user);
    }catch(error){
        console.log(error)
        res.status(500).json({
          error: error.message
        })
    }
    
}

export {
    signupUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUser
};