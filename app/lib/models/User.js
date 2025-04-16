const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "user" },
  username: String,
  avatar: {
    type: String,
    default: "http://localhost:157.159.116.203:3000/userdb/avatar/default.png",
  },
  testsHistory: [
    {
      idSujet: { type: mongoose.Schema.Types.ObjectId },
      date: { type: Date, default: Date.now },
      note: Number,
      duration: Number,
      transcription: [
        {
          role: { type: String, required: true },
          content: { type: String, required: true },
        },
      ],
    },
  ],
});

const User = mongoose.model("User", UserSchema);

router.post("/api/addEcosToHistory", async (req, res) => {
  try {
    const { id, ecos } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.testsHistory.push({
      idSujet: ecos.id,
      note: ecos.note,
      duration: ecos.duration,
      transcription: ecos.transcription,
    });
    await user.save();
    res.json({ok: true})
  } catch (error) {
    res.status(500).json({ erreur: "Failed to add to history", error });
  }
});

router.post("/api/getUserHistory", async (req,res ) => {
  try {
    const { id } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({userHistory: user.testsHistory})
    await user.save();
    res.json({ok: true})
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch to history" });
  }
})

router.post("/api/getUsers", async (req, res) => {
  try {
    const pw = req.body;
    if (pw !== process.env.PWAPI) { res.status(500).json({error: "Pas le droit tricheur"})}
    const Users = await User.find();
    res.json(Users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Users" });
  }
});

router.post("/api/getAvatar", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});

router.post("/api/changeUsername", async (req, res) => {
  try {
    const { id, username } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.username = username;
    await user.save(); // Save the changes
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user to change name" });
  }
});

router.post("/api/setAvatar", async (req, res) => {
  try {
    const { id, avatar } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.avatar = avatar;
    await user.save(); // Save the changes

    res.json({ sucess: true, message: "Avatar was successfully set" });
  } catch (error) {
    res.status(500).json({ error: "Error while setting avatar" });
  }
});

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
      process.env.JWT_SECRET || "your_secret_key",
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
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.role = "admin";
    await user.save(); // Save the changes

    res.json({ sucess: true, message: "User promoted to admin" });
  } catch (error) {
    res.status(500).json({ error: "Error while setting Admin" });
  }
});

router.post("/api/addUser", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    const existingUser2 = await User.findOne({ username: username });
    if (existingUser || existingUser2) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
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

    const user = await User.findByIdAndDelete({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User" });
  }
});

router.post("/api/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out" });
});

router.post("/api/getUser", async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User successfully retrieved", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch User" });
  }
});

router.post("/api/verifyRoleAdmin", async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not admin" });
    }
    res.json({ message: "User is admin", success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify role" });
  }
});

module.exports = router;
