const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", UserSchema);

router.get("/api/getUsers", async (req, res) => {
  try {
    const Users = await User.find();
    res.json(Users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Users" });
  }
});

const bcrypt = require("bcrypt");
const { clearPreviewData } = require("next/dist/server/api-utils");


router.post("/api/loginUser", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_secret_key",
      { expiresIn: "10h" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      id: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/api/setAdmin", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findOne({"_id": id}) 
    if (!user) {
      return res.status(404).json({error: "User not found"})
    }
    user.role = "admin"
    await user.save(); // Save the changes

    res.json({sucess: true,message: "User promoted to admin"})
  } catch (error) { res.status(500).json({error: "Error while setting Admin"})}
})

router.post("/api/addUser", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

router.post("/api/deleteUser", async (req, res) => {
  try {
    const { id } = req.body;
  
    const user = await User.findByIdAndDelete({"_id": id});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User" });
  }
});

router.post("/api/getUser", async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findOne(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User successfully retrieved", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch User" });
  }
});

router.post("/api/verifyRoleAdmin", async (req,res) => {
  try {
    const { id } = req.body;

    const user = await User.findOne({"_id": id});
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    if (user.role != "admin") {
      return res.status(401).json({error: "User not admin"});
    }
    res.json({message: "User is admin", sucess: true});
  } catch (error) {
    res.status(500).json({error: "Failed to verify role"})
  }
})



module.exports = router;
