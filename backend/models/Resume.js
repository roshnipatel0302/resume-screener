const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: Number, default: 0 }, // in years
    education: { type: String },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Shortlisted', 'Rejected', 'Interview Scheduled'], default: 'Pending' },
    filePath: { type: String, required: true },
    rawContent: { type: String },
    appliedRole: { type: String },
    interviewDate: { type: Date },
    meetingLink: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
