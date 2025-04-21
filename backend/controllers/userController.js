import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
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
        const { email, password } = req.body;
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
export {
    signupUser,
    loginUser,
    logoutUser
};