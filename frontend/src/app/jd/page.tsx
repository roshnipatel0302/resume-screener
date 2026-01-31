"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    MapPin,
    Briefcase,
    Clock,
    MoreVertical,
    Trash2,
    CheckCircle,
    X,
    Sparkles,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const JDPage = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: '',
        skills: '',
        experience: ''
    });

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error("Could not load job descriptions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/jobs', {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim())
            });
            toast.success("Job Description Created Successfully! 🚀");
            setIsModalOpen(false);
            setFormData({
                title: '',
                department: '',
                location: '',
                type: 'Full-time',
                description: '',
                skills: '',
                experience: ''
            });
            fetchJobs();
        } catch (error) {
            toast.error("Failed to create job");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this JD?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            toast.success("Job deleted");
            fetchJobs();
        } catch (error) {
            toast.error("Failed to delete job");
        }
    };

    return (
        <div className="space-y-8 pb-10 relative min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <LayoutGrid className="w-8 h-8 text-indigo-600" />
                        </div>
                        Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Descriptions</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Manage your active talent requirements</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Create New JD
                </button>
            </header>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {jobs.map((job, idx) => (
                        <motion.div
                            key={job._id || idx}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:scale-110 transition-transform origin-top-right" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Active
                                    </span>
                                    <button
                                        onClick={() => handleDelete(job._id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">{job.title}</h3>
                                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500 mb-6">
                                    <span className="flex items-center gap-1"><Briefcase size={14} className="text-indigo-500" /> {job.department}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-indigo-500" /> {job.location}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} className="text-indigo-500" /> {job.type}</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Required Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.slice(0, 4).map((skill: string, i: number) => (
                                                <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors cursor-default">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills.length > 4 && (
                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] font-bold">
                                                    +{job.skills.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">{job.experience} Exp.</span>
                                        <span className="text-xs font-bold text-indigo-600 group-hover:underline cursor-pointer">View Details</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Placeholder Card */}
                    <motion.div
                        layout
                        onClick={() => setIsModalOpen(true)}
                        className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all group min-h-[300px]"
                    >
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-100">
                            <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 group-hover:text-indigo-700">Add New Position</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Create a new job description to start matching candidates.</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Create Job Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Create Application Spec</h2>
                                        <p className="text-slate-500 text-sm">Define the role to find the perfect match.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Job Title</label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="e.g. Senior Product Designer"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Department</label>
                                            <input
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="e.g. Design"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Location</label>
                                            <input
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="Remote"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Type</label>
                                            <select
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option>Full-time</option>
                                                <option>Part-time</option>
                                                <option>Contract</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Experience</label>
                                            <input
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="e.g. 3-5 Years"
                                                value={formData.experience}
                                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Skills (Comma Separated)</label>
                                        <div className="relative">
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="React, Node.js, TypeScript..."
                                                value={formData.skills}
                                                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                            />
                                            <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                                            placeholder="Paste the full job description here..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Publish Job Requirement
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JDPage;
