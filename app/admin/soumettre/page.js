"use client";
import { useState } from "react";
import { saveAs } from 'file-saver';

export default function AddTopic() {
    const [title, setTitle] = useState("");
    const [theme, setTheme] = useState(""); // Situation de départ
    const [studentInstructions, setStudentInstructions] = useState("");
    const [evaluationGrid, setEvaluationGrid] = useState([{ critere: "", note: "" }]);
    const [patientInstructions, setPatientInstructions] = useState("");
    const [images, setImages] = useState([]); // Tableau d'images au lieu d'une seule
    const [message, setMessage] = useState("");
    const [docFile, setDocFile] = useState(null);

    const themes = [ // Liste des situations de départ
        "Constipation", "Diarrhée", "Distension abdominale", "Douleur abdominale",
        "Douleur anale", "Hépatomégalie", "Incontinence fécale", "Masse abdominale",
        "Masse / tuméfaction pariétale", "Méléna / rectorragie", "Régurgitation du nourrisson",
        "Nausées", "Vomissements", "Émission de sang par la bouche", "Anomalies de couleur des extrémités",
        "Adénopathies uniques ou multiples", "Amaigrissement", "Découverte d'anomalies à l'auscultation cardiaque",
        "Découverte d'un souffle vasculaire", "Découverte d'anomalies à l'auscultation pulmonaire", "Asthénie",
        "Diminution de la diurèse", "Anomalie de la miction", "Bouffées de chaleur", "Hypersudation",
        "Anomalies de la croissance staturo-pondérale", "Chute de la personne âgée", "Coma et troubles de conscience",
        "Contracture musculaire localisée ou généralisée", "Dénutrition / malnutrition", "Perte d'autonomie progressive",
        "Déshydratation de l'enfant", "Difficulté à procréer", "Douleur aiguë post-opératoire", "Douleur chronique",
        "Douleur de la région lombaire", "Éruptions chez l'enfant", "État de mort apparente", "Examen du nouveau-né à terme",
        "Écoulement mamelonnaire", "Gynécomastie", "Hypertension artérielle", "Découverte d'une hypotension artérielle",
        "Hyperthermie / fièvre", "Hypothermie", "Hypotonie / malaise du nourrisson", "Ictère", "Ictère chez le nouveau-né",
        "Ivresse aiguë", "Malaise / perte de connaissance", "Obésité et surpoids", "Odynophagie / dysphagie",
        "Hypertension durant la grossesse", "Œdème localisé ou diffus", "Pâleur de l'enfant", "Raideur articulaire",
        "Prise de poids", "Splénomégalie", "Tendance au saignement", "Hémorragie aiguë", "Syndrome polyuro-polydipsique",
        "Troubles de déglutition et fausses-routes", "Troubles sexuels et troubles de l'érection", "Vertige et sensation vertigineuse",
        "Déformation rachidienne", "Apparition d'une difficulté à la marche", "Douleurs articulaires", "Boiterie",
        "Claudication intermittente d'un membre", "Déformation articulaire", "Douleur d'un membre", "Douleur du rachis",
        "Douleur, brûlure, crampes et paresthésies", "Faiblesse musculaire", "Instabilité du genou", "Jambes lourdes",
        "Myalgies", "Acné", "Hirsutisme", "Alopécie et chute des cheveux", "Anomalies des ongles", "Bulles, éruption bulleuse",
        "Cicatrice anormale", "Lésion cutanée / \"grain de beauté\"", "Érythème", "Escarre", "Grosse jambe rouge aiguë",
        "Prurit", "Purpura / ecchymose / hématome", "Tâche cutanée du nourrisson", "Anomalies des muqueuses", "Ulcère cutané",
        "Vésicules, éruption vésiculeuse (cutanéomuqueuse)", "Troubles du cycle menstruel", "Découverte d'une anomalie au toucher rectal",
        "Brûlure mictionnelle", "Rétention aiguë d'urines", "Contraction utérine chez une femme enceinte", "Douleur pelvienne",
        "Douleur testiculaire", "Écoulement urétral", "Hématurie", "Incontinence urinaire", "Leucorrhées",
        "Découverte d'une malformation de l'appareil génital", "Masse pelvienne", "Prolapsus", "Anomalie des bourses",
        "Perte de liquide chez une femme enceinte avant terme", "Saignement génital anormal en post-partum",
        "Saignement génital durant la grossesse", "Saignement génital anormal (hors grossesse connue)", "Puberté précoce ou retardée",
        "Agitation", "Anomalie du développement psychomoteur", "Anxiété", "Apathie", "Céphalée", "Confusion mentale / désorientation",
        "Convulsions", "Déficit neurologique sensitif et/ou moteur", "Hallucinations", "Humeur triste / douleur morale",
        "Idées délirantes", "Idées ou conduites suicidaires / lésions auto-infligées", "Mouvements anormaux", "Paralysie faciale",
        "Tremblements", "Troubles de l'attention", "Troubles de l'équilibre", "Troubles de mémoire / déclin cognitif",
        "Troubles de conduites alimentaires (anorexie ou boulimie)", "Troubles du comportement chez l'enfant et l'adolescent",
        "Troubles du langage et/ou phonation", "Troubles du sommeil, insomnie ou hypersomnie", "Troubles obsessionnels, comportement compulsif",
        "Troubles psychiatriques en post-partum", "Anomalie de la vision", "Anomalies palpébrales", "Baisse de l'audition / surdité",
        "Sensation de brûlure oculaire", "Corps étranger de l'oreille ou du nez", "Diplopie", "Douleur cervico-faciale",
        "Douleur pharyngée", "Dysphonie", "Épistaxis", "Goitre ou nodule thyroïdien", "Ingestion ou inhalation d'un corps étranger",
        "Limitation de l'ouverture de bouche", "Œdème de la face et du cou", "Œil rouge et/ou douloureux", "Otalgie", "Otorrhée",
        "Rhinorrhée", "Ronflements", "Strabisme de l'enfant", "Tuméfaction cervico-faciale", "Bradycardie",
        "Détresse respiratoire aiguë", "Douleur thoracique", "Dyspnée", "Expectoration", "Anomalie de l'examen clinique mammaire",
        "Palpitations", "Tachycardie", "Toux", "Brûlure", "Morsures et piqûres", "Plaie", "Traumatisme abdomino-pelvien",
        "Traumatisme crânien", "Traumatisme des membres", "Traumatisme facial", "Traumatisme rachidien", "Traumatisme sévère",
        "Traumatisme thoracique", "Demande / prescription raisonnée et choix d'un examen diagnostique",
        "Réaction inflammatoire sur pièce opératoire / biopsie", "Interprétation d'un compte-rendu d'anatomopathologie",
        "Tumeurs malignes sur pièce opératoire / biopsie", "Analyse de la bandelette urinaire", "Analyse du liquide cérébro-spinal",
        "Prescription et interprétation d'un audiogramme", "Réalisation et interprétation d'un ECG", "Syndrome inflammatoire aigu ou chronique",
        "Bactérie multirésistante à l'antibiogramme", "Découverte de bacilles acido-alcoolo-résistants (BAAR) sur un crachat",
        "Analyse d'un examen cytobactériologique des urines (ECBU)", "Hémocultures positives",
        "Prescription et interprétation d'un examen microbiologique de selles", "Analyse d'un résultat de gaz du sang",
        "Analyse de l'électrophorèse des protéines sériques", "Analyse du bilan thyroïdien", "Analyse du bilan lipidique",
        "Analyse du sédiment urinaire", "Analyse des bicarbonates", "Cholestase", "Créatinine augmentée", "Dyscalcémie",
        "Dysklémie", "Dysnatrémie", "Élévation de la protéine C-réactive (CRP)", "Élévation des enzymes cardiaques",
        "Élévation des enzymes pancréatiques", "Élévation des transaminases sans cholestase", "Ferritine : baisse ou augmentation",
        "Hyperglycémie", "Hypoglycémie", "Hyperprotidémie", "Hypoprotidémie", "Protéinurie", "Allongement du temps de céphalée activée (TCA)",
        "Anomalie des indices érythrocytaires (taux d'hémoglobine, hématocrite, etc.)", "Anomalie des plaquettes", "Anomalie des leucocytes",
        "Baisse de l'hémoglobine", "Diminution du taux de prothrombine (TP)", "Hyperéosinophilie", "Hyperlymphocytose",
        "Interprétation d'un myélogramme", "Prescription et analyse du frottis sanguin", "Interprétation de l'hémogramme",
        "Découverte d'une anomalie abdominale à l'examen d'imagerie médicale", "Découverte d'une anomalie cervico-faciale à l'examen d'imagerie médicale",
        "Découverte d'une anomalie du cerveau à l'examen d'imagerie médicale", "Découverte d'une anomalie médullaire ou vertébrale à l'examen d'imagerie médicale",
        "Découverte d'une anomalie osseuse et articulaire à l'examen d'imagerie médicale", "Découverte d'une anomalie pelvienne à l'examen d'imagerie médicale",
        "Rédaction de la demande d'un examen d'imagerie", "Demande d'un examen d'imagerie",
        "Demande d'explication d'un patient sur le déroulement, les risques et les bénéfices attendus d'un examen d'imagerie",
        "Identifier / reconnaître les différents examens d'imagerie (type / fenêtre/ séquences / incidences / injection)",
        "Interprétation d'une recherche d'accès palustre", "Découverte, diagnostic positif et dépistage rapide du VIH",
        "Interprétation d'un résultat de sérologie", "Prescription et interprétation de tests allergologiques (patch tests, prick tests, IDR)",
        "Demande et préparation aux examens endoscopiques (bronchiques, digestifs)", "Explication pré-opératoire et recueil de consentement d'un geste invasif diagnostique ou thérapeutique",
        "Expliquer une hospitalisation en soins psychiatriques à la demande d'un tiers", "Gestion du sevrage alcoolique contraint",
        "Gestion du sevrage tabagique contraint", "Mise en place et suivi d'un appareil d'immobilisation", "Mise en place et suivi d'une contention mécanique",
        "Prescription d'un appareillage simple", "Prescription d'un soin ambulatoire", "Prescription d'une rééducation",
        "Prescription et suivi d'un traitement par anticoagulant et/ou anti-agrégant", "Prescrire des anti-inflammatoires non-stéroïdiens (AINS)",
        "Prescrire des antalgiques", "Prescrire des corticoïdes par voie générale ou locale", "Prescription d'un hypolipémiant",
        "Prescrire des diurétiques", "Prescrire des soins associés à l'initiation d'une chimiothérapie", "Prescrire un anti-infectieux",
        "Prescrire un hypnotique / anxiolytique", "Prescrire une contraception et contraception d'urgence", "Prévention de la douleur liée aux soins",
        "Évaluation et prise en charge de la douleur aiguë", "Évaluation et prise en charge de la douleur chronique",
        "Évaluation et prise en charge de la douleur de l'enfant et du nourrisson", "Accès palustre", "Prise en charge d'une ectoparasitose",
        "Adaptation des traitements sur un terrain particulier (insuffisant rénal, insuffisant hépatique, grossesse, personne âgée, etc.)",
        "Consultation de suivi d'un nourrisson en bonne santé", "Consultation de suivi d'un patient polymédiqué",
        "Consultation de suivi d'un patient polymorbide", "Consultation de suivi d'une grossesse normale",
        "Consultation de suivi et traitement de fond d'un patient souffrant d'un trouble psychiatrique chronique (hors dépression)",
        "Demande d'amaigrissement", "Prescription et surveillance d'une voie d'abord vasculaire", "Prescrire et réaliser une transfusion sanguine",
        "Prise en charge d'un allaitement normal et difficile", "Prise en charge d'un patient présentant une tuberculose bacillaire",
        "Prise en charge d'une suspicion de thrombophilie", "Prise en charge d'un patient en décubitus prolongé",
        "Consultation de suivi d'un patient présentant une lombalgie aiguë ou chronique", "Consultation de suivi d'une femme ménopausée",
        "Consultation de suivi d'une pathologie chronique", "Prescription d'une insulinothérapie, consultation de suivi, éducation d'un patient diabétique de type 1",
        "Prescription médicamenteuse, consultation de suivi et éducation d'un patient diabétique de type 2 ou ayant un diabète secondaire",
        "Prescription médicamenteuse, consultation de suivi et éducation d'un patient hypertendu",
        "Consultation de suivi et éducation thérapeutique d'un patient asthmatique",
        "Consultation de suivi et éducation thérapeutique d'un patient avec hypothyroïdie",
        "Consultation de suivi et éducation thérapeutique d'un patient avec un antécédent cardiovasculaire",
        "Consultation de suivi et éducation thérapeutique d'un patient BPCO", "Consultation de suivi et éducation thérapeutique d'un patient insuffisant cardiaque",
        "Consultation de suivi et traitement de fond d'un patient dépressif", "Consultation et suivi d'un patient épileptique",
        "Suivi d'un patient en insuffisance rénale chronique", "Suivi du patient immunodéprimé", "Première consultation d'addictologie",
        "Consultation de suivi addictologie", "Consultation de suivi en gynécologie", "Consultation de suivi gériatrique",
        "Consultation de suivi pédiatrique", "Consultation du suivi en cancérologie", "Consultation et suivi d'un patient ayant des troubles cognitifs",
        "Consultation post-événement allergique", "Consultation pré-anesthésique", "Consultation suite à un contact tuberculeux",
        "Consultation aux voyageurs", "Prévention / dépistage des cancers de l'adulte", "Dépistage du diabète gestationnel",
        "Dépistage et conseils devant une infection sexuellement transmissible", "Dépistage et prévention ostéoporose",
        "Dépistage prénatal de la trisomie 21", "Dépistage néonatal systématique", "Patient à risque suicidaire",
        "Prévention chez un malade contagieux", "Prévention des infections liées aux soins", "Prévention des risques fœtaux",
        "Prévention des risques liés à l'alcool", "Prévention des risques liés au tabac", "Prévention des risques professionnels",
        "Identifier les conséquences d'une pathologie / situation sur le maintien d'un emploi", "Dépistage et prévention des violences faites aux femmes",
        "Prévention de la mort inexpliquée du nourrisson", "Prévention du surpoids et de l'obésité", "Prévention des maladies cardiovasculaires",
        "Suspicion de maltraitance et enfance en danger", "Vaccinations de l'adulte et de l'enfant", "Prévention de l'exposition aux écrans",
        "Modification thérapeutique du mode de vie (sommeil, activité physique, alimentation, etc.)", "Prévention des accidents domestiques",
        "Accident du travail", "Annonce d'un diagnostic de maladie grave au patient et/ou à sa famille", "Annonce d'une maladie chronique",
        "Conduite à tenir devant une demande d'accès à l'information/au dossier médical", "Accompagnement global d'un aidant",
        "Découverte d'un aléa thérapeutique ou d'une erreur médicale", "Demande d'interruption volontaire de grossesse",
        "Demande d'un certificat médical initial", "Demande de traitement et investigation inappropriés",
        "Évaluation de l'aptitude au sport et rédaction d'un certificat de non contre-indication", "Exposition accidentelle aux liquides biologiques",
        "Identification, prise en soin et suivi d'un patient en situation palliative", "Prescription médicale chez un patient en situation de précarité",
        "Prescrire un arrêt de travail", "Prise volontaire ou involontaire d'un toxique ou d'un médicament potentiellement toxique",
        "Réaction à un événement potentiellement traumatique", "Rédaction d'une ordonnance / d'un courrier médical", "Refus de traitement et de prise en charge recommandés",
        "Situation de harcèlement", "Situation de handicap", "Situation sanitaire exceptionnelle", "Situation sociale précaire et isolement",
        "Suspicion d'un effet indésirable des médicaments ou d'un soin", "Troubles des interactions sociales / difficultés de socialisation",
        "Violences sexuelles", "Violences psychologiques et/ou physiques", "Expliquer un traitement au patient (adulte / enfant / adolescent)",
        "Identifier une situation de déconditionnement à l'effort", "Évaluation de l'observance thérapeutique", "Organisation de la sortie d'hospitalisation",
        "Information et suivi d'un patient en chirurgie ambulatoire"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Generate the JSON transcription
        const transcription = generateTranscription();
    
        try {
            // Step 1: Send transcription data (without image files) to API
            const response = await fetch('http://157.159.116.203:5001/Ecos/api/addEcos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transcription),
            });
    
            const data = await response.json();
    
            if (response.ok && data._id) {
                // Step 2: If there are images, upload them separately using the returned _id
                if (images.length > 0) {
                    // Upload each image one by one
                    for (const image of images) {
                        const formData = new FormData();
                        formData.append('image', image);
                        formData.append('id', data._id); // So backend knows what filename to give
                        
                        const imageResponse = await fetch('http://157.159.116.203:5001/Ecos/api/uploadImage', {
                            method: 'POST',
                            body: formData,
                        });
                        
                        if (!imageResponse.ok) {
                            throw new Error(`Échec de l'envoi de l'image ${image.name}`);
                        }
                    }
                }
    
                setMessage("Sujet ajouté avec succès !");
                resetForm();
            } else {
                setMessage("Erreur lors de l'ajout du sujet.");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Erreur lors de l'ajout du sujet.");
        }
    };
    
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImages(prevImages => [...prevImages, ...files]);
        }
    };

    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const handleEvaluationGridChange = (index, field, value) => {
        const newGrid = [...evaluationGrid];
        if (field === "note") {
            // Ensure note are positive integers
            const note = parseInt(value, 10);
            if (!isNaN(note) && note >= 0) {
                newGrid[index][field] = note;
            }
        } else {
            newGrid[index][field] = value;
        }
        setEvaluationGrid(newGrid);
    };

    const addEvaluationRow = () => {
        setEvaluationGrid([...evaluationGrid, { critere: "", note: "" }]);
    };

    const handleDocSubmit = (e) => {
        e.preventDefault();
        if (docFile) {
            // Here you would normally send the DOCX file to your backend for processing
            setMessage("Sujet importé avec succès à partir du fichier DOCX!");
            setDocFile(null);
        }
    };

    const generateTranscription = () => {
        const transcription = {
            title: title,
            consigneEtudiant: studentInstructions,
            grilleEvaluation: evaluationGrid.map(row => ({
                consigne: row.critere,
                note: row.note
            })),
            consignesPourPatient: patientInstructions,
        };
    
        if (images.length > 0) {
            transcription.images = images.map(img => img.name);
        }
    
        if (theme) {
            transcription.theme = theme;
        }
    
        return transcription;
    };
    
    const resetForm = () => {
        setTitle("");
        setTheme("");
        setStudentInstructions("");
        setEvaluationGrid([{ critere: "", note: "" }]);
        setPatientInstructions("");
        setImages([]);
        setDocFile(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4 mb-10">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Ajouter un Nouveau Sujet</h1>
                {message && <p className="text-center text-green-600">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Titre du sujet"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Situation de départ</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            required
                        >
                            <option value="" disabled>Sélectionnez une situation de départ</option>
                            {themes.map((themeOption, index) => (
                                <option key={index} value={themeOption}>
                                    {themeOption}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Consignes pour les étudiants</label>
                        <textarea
                            value={studentInstructions}
                            onChange={(e) => setStudentInstructions(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Consignes pour les étudiants"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Grille d'évaluation</label>
                        {evaluationGrid.map((row, index) => (
                            <div key={index} className="flex space-x-2 mb-2 items-center place-items-center">
                                <p className="py-2 mt-2 text-black">{index +1}</p>
                                <input
                                    type="text"
                                    value={row.critere}
                                    onChange={(e) => handleEvaluationGridChange(index, "critere", e.target.value)}
                                    className="flex-1 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                                    placeholder="Critère"
                                    required
                                />
                                <input
                                    type="number"
                                    value={row.note}
                                    onChange={(e) => handleEvaluationGridChange(index, "note", e.target.value)}
                                    className="w-20 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                                    placeholder="Note"
                                    min="0"
                                    step="1"
                                    required
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEvaluationRow}
                            className="text-gray-600 underline"
                        >
                            Ajouter une ligne
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Consignes pour le patient</label>
                        <textarea
                            value={patientInstructions}
                            onChange={(e) => setPatientInstructions(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Consignes pour le patient"
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Images</label>
                        <label className="block w-full px-4 py-2 mt-2 bg-blue-500 text-white text-center rounded cursor-pointer hover:bg-blue-700">
                            Ajouter des images
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                multiple
                            />
                        </label>
                        
                        {/* Affichage des images sélectionnées */}
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative border rounded-md p-2">
                                        <img 
                                            src={URL.createObjectURL(img)} 
                                            alt={`Image ${index + 1}`} 
                                            className="h-24 w-auto object-contain mx-auto"
                                        />
                                        <p className="text-xs text-center mt-1 text-gray-700 truncate" title={img.name}>
                                            {img.name}
                                        </p>
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">Ajouter</button>
                </form>
            </div>
        </div>
    );
}
