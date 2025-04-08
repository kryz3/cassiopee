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

router.post("/api/getEcosTitles", async (req, res) => {
  try {
    const Ecoss = await Ecos.find({}, 'title _id'); // only select 'title' and '_id'
    res.json(Ecoss);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Ecos's" });
  }
});

router.post("/api/getEcosStudentInstructions", async (req, res) => {
  try {
    const { id } = req.body;

    const ecos = await Ecos.findOne({"_id": id});
    if (!ecos) {
      return res.status(404).json({error: "Ecos not found"})
  }
  res.json({
    message: "Ecos student consigns retrieved",
    instructions: ecos.consigneEtudiant
  }) }  
 catch (error) {
  res.status(500).json({error: "Failed to retrieved Ecos student instructions"})}
})

router.post("/api/getEcosImage", async (req, res) => {
  try {
    const { id } = req.body;

    const ecos = await Ecos.findOne({"_id": id});
    if (!ecos.image) { 
      return res.json({message: "Pas d'image", image:null})
    }
  if (!ecos.image) { res.json({message: "Pas d'image", image:null})}
  res.json({
    message: "Ecos image  retrieved",
    image: ecos.image
  }) }  
 catch (error) {
  res.status(500).json({error: "Failed to retrieved Ecos image"})}
})

router.post("/api/getEcosPatientInstructions", async (req, res) => {
  try {
    const { id } = req.body;

    const ecos = await Ecos.findOne({"_id": id});
    if (!ecos) {
      return res.status(404).json({error: "Ecos not found"})
  }
  res.json({
    message: "Ecos patient consigns retrieved",
    instructions: ecos.consignesPourPatient
  }) }  
 catch (error) {
  res.status(500).json({error: "Failed to retrieved Ecos patient instructions"})}
})

router.post("/api/getEcosGrid", async (req, res) => {
  try {
    const { id } = req.body;

    const ecos = await Ecos.findOne({"_id": id});
    if (!ecos) {
      return res.status(404).json({error: "Ecos not found"})
  }
  res.json({
    message: "Ecos grid retrieved",
    instructions: ecos.grilleEvaluation
  }) }  
 catch (error) {
  res.status(500).json({error: "Failed to retrieved Ecos grid"})}
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

const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../../', 'public', 'ecos'));
  },
  // Save with original name or temp name
  filename: function (req, file, cb) {
      cb(null, file.originalname); // or `Date.now() + path.extname(file.originalname)`
  }
});


const upload = multer({ storage });

router.post('/api/uploadImage', upload.single('image'), async (req, res) => {
  const id = req.body.id;

  if (!req.file || !id) {
      return res.status(400).send("Fichier ou ID manquant");
  }

  const oldPath = req.file.path;
  const newFilename = `ecos_${id}.png`;
  const newPath = path.join(path.dirname(oldPath), newFilename);

  // Renommer le fichier
  fs.rename(oldPath, newPath, async (err) => {
      if (err) {
          console.error("Erreur lors du renommage :", err);
          return res.status(500).send("Erreur lors du renommage du fichier");
      }

      try {
          // Mettre à jour le champ image du document Ecos
          const updatedEcos = await Ecos.findByIdAndUpdate(
              id,
              { image: newFilename },
              { new: true } // pour retourner le document mis à jour
          );

          if (!updatedEcos) {
              return res.status(404).send("Ecos non trouvé");
          }

          res.status(200).send({ message: 'Image uploadée avec succès', filename: newFilename });
      } catch (updateError) {
          console.error("Erreur lors de la mise à jour de l'image dans la base :", updateError);
          res.status(500).send("Erreur lors de la mise à jour de l'image");
      }
  });
});


module.exports = router;


