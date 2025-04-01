const mongoose = require('mongoose');

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


module.exports = mongoose.model("Ecos", EcosSchema)