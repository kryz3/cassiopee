const mongoose = require('mongoose');
const express = require("express");
const app = express();
const router = express.Router();

const QASchema = new mongoose.Schema({
  question: String,
  answer: String,
  type: String,
  Subject: String,
  Verified: Boolean,
})

const QA = mongoose.model("QA", QASchema)

router.get("/api/getQAs", async (req, res) => {
  try {
  const QAs = await QA.find();
  res.json(QAs) 
  } catch (error) {
    res.status(500).json({error: "Failed to fetch QAs"})
  }
})

router.post("/api/addQA", async (req, res) => {
  try {
    const newQA = new QA(req.body);
    await newQA.save();
    res.json(newQA);
  } catch (error) {
    res.status(500).json({ error: "Failed to add QA" });
  }
});

router.post("/api/deleteQA", async (req, res) => {
  try {
    const { id } = req.body;


    const deletedQA = await QA.findByIdAndDelete(id);
    if (!deletedQA) {
      return res.status(404).json({error: "QA not found"})
  }
  res.json({message: "QA deleted successfully", QA})}
 catch (error) {
  res.status(500).json({error: "Failed to delete QA"})}
})

router.post("/api/verifyQA", async (req, res) => {
  try {
    const { id } = req.body;

    // Find the document and toggle the 'Verified' field
    const updatedQA = await QA.findByIdAndUpdate(
      id,
      [{ $set: { Verified: { $not: "$Verified" } } }], // MongoDB aggregation to toggle boolean
      { new: true } // Return the updated document
    );

    if (!updatedQA) {
      return res.status(404).json({ message: "QA not found" });
    }

    res.json({ message: "Verification status updated", updatedQA });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;