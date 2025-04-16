const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const userRoutes = require("./lib/models/User")
const ecosRoutes = require("./lib/models/Ecos")

const app = express();

const corsOptions = {
  origin: "http://157.159.116.203:5030", // Your frontend URL
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions)); // Use only this one, remove duplicate app.use(cors())
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mydb")
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use("/User", userRoutes);
app.use("/Ecos", ecosRoutes);
  

app.listen(5001, () => console.log("Server running on port 5001"));

