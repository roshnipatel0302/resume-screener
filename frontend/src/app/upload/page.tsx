"use client";

import React, { useState } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, CheckCircle, Sparkles, Briefcase, GraduationCap, LayoutList, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const UploadPage = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [jd, setJd] = useState({
        roleTitle: '',
        requiredSkills: '',
        minExperience: 0,
        preferredEducation: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Deduplicate files by name
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles];
            });
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('resumes', file));

        const jobDescription = {
            ...jd,
            requiredSkills: jd.requiredSkills.split(',').map(s => s.trim())
        };

        formData.append('jobDescription', JSON.stringify(jobDescription));

        try {
            await api.post('/resumes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                    setProgress(percentCompleted);
                }
            });
            setFiles([]);
            setProgress(0);
            toast.success('Resumes processed! Rankings updated.', {
                icon: '🚀',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Analysis failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-12"
        >
            <div className="relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -left-4 -z-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <header className="text-center space-y-2 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={12} />
                        <span>AI Powered Screening</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Candidate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Evaluation Engine</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Drag, drop, and let our neural networks rank your candidates instantly.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Job Spec */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl shadow-indigo-100/50 border border-white/50 ring-1 ring-white/60"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-indigo-50">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Job Context</h2>
                                <p className="text-xs text-slate-500 font-medium">Define the role requirements</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Role Title</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all group-hover:border-slate-300"
                                        placeholder="e.g. Senior UX Designer"
                                        value={jd.roleTitle}
                                        onChange={e => setJd({ ...jd, roleTitle: e.target.value })}
                                    />
                                    <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Must-Have Skills (Comma separated)</label>
                                <div className="relative group">
                                    <textarea
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[100px] resize-none group-hover:border-slate-300"
                                        placeholder="Figma, Prototyping, CSS..."
                                        value={jd.requiredSkills}
                                        onChange={e => setJd({ ...jd, requiredSkills: e.target.value })}
                                    />
                                    <Sparkles className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Min. Exp (Yrs)</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all group-hover:border-slate-300"
                                            value={jd.minExperience}
                                            onChange={e => setJd({ ...jd, minExperience: parseInt(e.target.value) })}
                                        />
                                        <LayoutList className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Education</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all group-hover:border-slate-300"
                                            placeholder="Any"
                                            value={jd.preferredEducation}
                                            onChange={e => setJd({ ...jd, preferredEducation: e.target.value })}
                                        />
                                        <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-8 bg-white/60 backdrop-blur-md p-8 rounded-[32px] border border-white shadow-xl shadow-slate-200/50 flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <UploadCloud size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Document Analysis</h2>
                                <p className="text-xs text-slate-500 font-medium">Supported Document Formats: PDF, DOCX, TXT</p>
                            </div>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) {
                                    const newFiles = Array.from(e.dataTransfer.files);
                                    setFiles(prev => [...prev, ...newFiles]);
                                }
                            }}
                            className={`flex-1 relative border-3 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-12 overflow-hidden
                                ${isDragging
                                    ? 'border-indigo-500 bg-indigo-50 scale-[0.99]'
                                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-lg'
                                }`}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileChange}
                            />

                            {/* Animated Background Icon */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                <UploadCloud size={300} />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 ${isDragging ? 'bg-indigo-600 scale-110' : 'bg-white text-indigo-600 group-hover:scale-110'}`}>
                                    <UploadCloud size={40} className={isDragging ? 'text-white' : ''} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">
                                    {isDragging ? 'Drop it like it\'s hot!' : 'Drop resumes here'}
                                </h3>
                                <p className="text-slate-500 font-medium mb-6">or click to browse your computer</p>
                                <div className="inline-flex gap-2">
                                    {['PDF', 'DOCX', 'TXT'].map(fmt => (
                                        <span key={fmt} className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm">{fmt}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {files.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6"
                                >
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Staged Records ({files.length})</h4>
                                        <button onClick={() => setFiles([])} className="text-[10px] font-bold text-rose-500 hover:underline">Clear All</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {files.map((file, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                key={`${file.name}-${idx}`}
                                                className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Area */}
                        <AnimatePresence>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm">Processing Neural Network</h4>
                                                <p className="text-xs text-slate-400">Extracting entities and ranking profiles...</p>
                                            </div>
                                            <span className="text-2xl font-black text-indigo-400">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    {/* Abstract shapes */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={files.length === 0 || uploading}
                            onClick={handleUpload}
                            className={`mt-6 w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group
                                ${files.length > 0 && !uploading
                                    ? 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-900/20 active:scale-[0.98]'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {uploading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Sparkles size={18} />
                                </motion.div>
                            ) : (
                                <Sparkles size={18} className={files.length > 0 ? "animate-pulse" : ""} />
                            )}
                            <span>{uploading ? 'Analyzing...' : 'Run Analysis'}</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default UploadPage;
