const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const User = new mongoose.Schema({
  email: String,
  password: String,
})

router.get("/api/getUsers", async (req, res) => {
  try {
  const Users = await User.find();
  res.json(Users) 
  } catch (error) {
    res.status(500).json({error: "Failed to fetch Users"})
  }
})

router.post("/api/addUser", async (req, res) => {
  try {
    const User = new User(req.body);
    await User.save();
    res.json(User)
  } catch (error) {
    res.status(500).json({error: "Failed to add User"})
  }
})

router.post("/api/deleteUser", async (req, res) => {
  try {
    const { id } = req.params;

    const User = await User.findByIdAndDelete(id);
    if (!User) {
      return res.status(404).json({error: "User not found"})
  }
  res.json({message: "User deleted successfully", User})}
 catch (error) {
  res.status(500).json({error: "Failed to delete User"})}
})

module.exports = router;