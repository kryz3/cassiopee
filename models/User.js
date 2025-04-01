const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: { type: String, default: "user" },
    username: String,
    avatar: { type: String, default: "http://localhost:3000/userdb/avatar/default.png" },
});

module.exports = mongoose.model("User", UserSchema);