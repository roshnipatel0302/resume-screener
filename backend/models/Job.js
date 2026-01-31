const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, default: 'Engineering' },
    location: { type: String, default: 'Remote' },
    type: { type: String, default: 'Full-time' },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    experience: { type: String, default: '0-2 years' },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
