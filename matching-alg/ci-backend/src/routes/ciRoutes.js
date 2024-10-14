const express = require('express');
const ciController = require('../controllers/ciController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Routen
router.get('/', ciController.getCI);
router.post('/', ciController.updateCI);
router.post('/upload-logo', upload.single('logo'), ciController.uploadLogo);
router.post('/upload-jobs', upload.single('jsonFile'), ciController.uploadJobsJson); // JSON hochladen
router.get('/jobs', ciController.getJobs); // Jobdaten abrufen

module.exports = router;
