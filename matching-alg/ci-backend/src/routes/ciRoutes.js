const express = require('express');
const multer = require('multer');
const ciController = require('../controllers/ciController');

const router = express.Router();

// Setup für Datei-Uploads mit Multer
const upload = multer({ dest: 'uploads/' });

// Route zum Abrufen der aktuellen CI-Daten
router.get('/', ciController.getCI);

// Route zum Aktualisieren der CI-Daten
router.post('/', ciController.updateCI);

// Route zum Hochladen eines Firmenlogos
router.post('/upload-logo', upload.single('logo'), ciController.uploadLogo);

module.exports = router;
