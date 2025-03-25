const mongoose = require('mongoose');
const express = require("express");
const app = express();
const router = express.Router();

const EcosSchema = new mongoose.Schema({
  title: { type: String, required: true },
  consigneEtudiant: { type: String, required: true },
  grilleEvaluation: {
    type: [
      {
        consigne: { type: String, required: true },
        note: { type: Number, required: true }
      }
    ],
    required: true
  },
  consignesPourPatient: { type: String, required: true },
  image: { type: String, default: null },
  theme: { type: String, default: null },
  sumGrade: { type: Number, default: null },
  numbGrade: { type: Number, default: null },
});


const Ecos = mongoose.model("Ecos", EcosSchema)

router.get("/api/getEcoss", async (req, res) => {
  try {
  const Ecoss = await Ecos.find();
  res.json(Ecoss) 
  } catch (error) {
    res.status(500).json({error: "Failed to fetch Ecos's"})
  }
})

router.post("/api/addEcos", async (req, res) => {
  try {
    const newEcos = new Ecos(req.body);
    await newEcos.save();
    res.json(newEcos);
  } catch (error) {
    res.status(500).json({ error: "Failed to add Ecos" });
  }
});

router.post("/api/deleteEcos", async (req, res) => {
  try {
    const { id } = req.body;


    const deletedEcos = await Ecos.findByIdAndDelete(id);
    if (!deletedEcos) {
      return res.status(404).json({error: "Ecos not found"})
  }
  res.json({message: "Ecos deleted successfully", Ecos})}
 catch (error) {
  res.status(500).json({error: "Failed to delete Ecos"})}
})

router.post("/api/addGradeToThisEcos", async (req, res) => {
  try {
    const { id, grade } = req.body;
    const ecos = await Ecos.findOne({"_id": id});
    if (!ecos) {
      return res.status(404).json({ error: "Ecos not found" });
    }
    ecos.numbGrade++
    ecos.avgGrade = (ecos.sumGrade + grade ) / ecos.numbGrade
    await ecos.save(); // Save the changes
  } catch (error ) {
    res.status(500).json({error: "Couldn't add grade"})
  }
})

module.exports = router;