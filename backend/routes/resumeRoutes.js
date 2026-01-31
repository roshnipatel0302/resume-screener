const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../utils/fileUpload');

router.post('/upload', upload.array('resumes', 20), resumeController.uploadResumes);
router.get('/', resumeController.getAllResumes);
router.patch('/:id/status', resumeController.shortlistResume);
router.patch('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
