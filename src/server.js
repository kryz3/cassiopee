const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser")

const QARoutes = require("./lib/models/QA")
const userRoutes = require("./lib/models/User")

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", // Your frontend URL
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions)); // Use only this one, remove duplicate app.use(cors())
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect("mongodb://localhost:27017/mydb")
  .then(() => console.log("Connected!"));

app.use("/QA", QARoutes);
app.use("/User", userRoutes);
  

app.listen(5001, () => console.log("Server running on port 5001"));
