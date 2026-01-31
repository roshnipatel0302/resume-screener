const Resume = require('../models/Resume');
const parserService = require('../services/parserService');
const rankingService = require('../services/rankingService');
const path = require('path');
const fs = require('fs');

exports.uploadResumes = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // The fileFilter logic is typically part of the multer middleware configuration
        // before this controller function is called.
        // However, if we were to validate here, it would look something like this:
        const allowedFiletypes = /pdf|docx|txt/;
        for (const file of req.files) {
            const extname = allowedFiletypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedFiletypes.test(file.mimetype) || file.originalname.endsWith('.txt');
            if (!(extname || mimetype)) {
                // Clean up already uploaded files if any
                req.files.forEach(f => fs.unlinkSync(f.path));
                return res.status(400).json({ message: 'Error: Only PDF, DOCX and TXT files are allowed!' });
            }
        }

        const jobDescription = JSON.parse(req.body.jobDescription || '{}');
        const results = [];

        for (const file of req.files) {
            const filePath = file.path;
            const ext = path.extname(file.originalname).toLowerCase();

            let rawText = '';
            if (ext === '.pdf') {
                rawText = await parserService.parsePDF(filePath);
            } else if (ext === '.docx') {
                rawText = await parserService.parseDOCX(filePath);
            } else if (ext === '.txt') {
                rawText = fs.readFileSync(filePath, 'utf8');
            }

            const extractedData = parserService.extractData(rawText);
            const scoreData = rankingService.calculateScore(extractedData, jobDescription);

            const resume = new Resume({
                name: file.originalname.split('.')[0], // fallback name
                ...extractedData,
                score: scoreData.totalScore,
                filePath: file.path,
                rawContent: rawText,
                appliedRole: jobDescription.roleTitle || 'General'
            });

            await resume.save();
            results.push(resume);
        }

        res.status(201).json({
            message: `${results.length} resumes uploaded and processed`,
            data: results
        });
    } catch (error) {
        console.error('Error uploading resumes:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ score: -1 });
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resumes', error: error.message });
    }
};

exports.shortlistResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const resume = await Resume.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};

exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Error updating resume', error: error.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findByIdAndDelete(id);
        if (resume && resume.filePath) {
            fs.unlinkSync(resume.filePath);
        }
        res.status(200).json({ message: 'Resume deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting resume', error: error.message });
    }
};
