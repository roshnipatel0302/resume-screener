const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const parsePDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

const parseDOCX = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};

const extractData = (text) => {
    // Simple extraction logic - in a real app, this would use more complex regex or AI
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const skillsList = [
        'react', 'nodejs', 'javascript', 'typescript', 'mongodb', 'express', 'python',
        'java', 'c++', 'aws', 'docker', 'kubernetes', 'html', 'css', 'sql', 'next.js',
        'tailwind', 'git', 'rest api', 'graphql'
    ];

    const foundSkills = skillsList.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    );

    // Extract Email
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
    const email = text.match(emailRegex)?.[0] || '';

    // Extract Phone
    const phoneRegex = /(\+?\d{1,3}[- ]?)?\d{10}/g;
    const phone = text.match(phoneRegex)?.[0] || '';

    // Extract Experience (very naive year detection)
    const expRegex = /(\d+)\+?\s*years?\b/gi;
    const matches = [...text.matchAll(expRegex)];
    let experience = 0;
    if (matches.length > 0) {
        experience = Math.max(...matches.map(m => parseInt(m[1])));
    }

    // Extract Education
    const eduKeywords = ['Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'Degree', 'University', 'College'];
    const education = eduKeywords.find(edu => text.includes(edu)) || 'Not specified';

    return {
        email,
        phone,
        skills: foundSkills,
        experience,
        education
    };
};

module.exports = {
    parsePDF,
    parseDOCX,
    extractData
};
