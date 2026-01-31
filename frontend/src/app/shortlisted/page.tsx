"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Briefcase, Mail, Phone, Calendar, CheckCircle, AlertTriangle, X, ChevronRight, Star } from 'lucide-react';
import api from '@/lib/api';

const ShortlistedPage = () => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const fetchShortlisted = async () => {
        try {
            const response = await api.get('resumes');
            // Show both pending shortlist and already scheduled
            setCandidates(response.data.filter((r: any) =>
                r.status === 'Shortlisted' || r.status === 'Interview Scheduled'
            ));
        } catch (error) {
            console.error('Error fetching shortlisted:', error);
            toast.error("Failed to load candidates");
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = (candidate: any) => {
        if (candidate.status === 'Interview Scheduled') {
            toast.success('Interview already scheduled!');
            return;
        }

        // 1. Open Email Client
        const subject = `Interview Invitation - ${candidate.appliedRole || 'Position'}`;
        const body = `Hi ${candidate.name},\n\nWe are impressed with your profile and would like to invite you for an interview regarding your application.\n\nPlease let us know your availability.\n\nBest regards,\nRecruitment Team`;
        window.location.href = `mailto:${candidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // 2. Open Confirmation Modal
        setConfirmingId(candidate._id);
    };

    const confirmSchedule = async () => {
        if (!confirmingId) return;

        // Optimistic UI update
        const updatedCandidates = candidates.map(c =>
            c._id === confirmingId ? { ...c, status: 'Interview Scheduled' } : c
        );
        setCandidates(updatedCandidates);

        try {
            await api.patch(`resumes/${confirmingId}/status`, { status: 'Interview Scheduled' });
            toast.success(`Candidate marked as Scheduled`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to update status in database");
            fetchShortlisted(); // Revert on error
        } finally {
            setConfirmingId(null);
        }
    };

    useEffect(() => {
        fetchShortlisted();
    }, []);

    const downloadCSV = () => {
        if (candidates.length === 0) return;

        const headers = ['Name', 'Email', 'Phone', 'Skills', 'Experience', 'Score'];
        const csvContent = [
            headers.join(','),
            ...candidates.map(c => [
                c.name,
                c.email,
                c.phone,
                `"${c.skills.join(', ')}"`,
                c.experience,
                c.score
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'shortlisted_candidates.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exported successfully");
    };

    // Calculate stats
    const scheduledCount = candidates.filter(c => c.status === 'Interview Scheduled').length;
    const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((acc, curr) => acc + curr.score, 0) / candidates.length) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-10 relative"
        >
            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl border border-white/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Mail className="w-10 h-10 text-emerald-500" />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 text-center tracking-tight">Invite Sent?</h3>
                            <p className="text-slate-500 text-center mt-3 font-medium leading-relaxed px-4">
                                We've opened your email client. Please confirm if you successfully sent the invitation to this candidate.
                            </p>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => setConfirmingId(null)}
                                    className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSchedule}
                                    className="flex-1 py-4 text-white font-bold bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-indigo-500/20">
                            Elite Talent Pool
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{candidates.length} Qualified</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                        Shortlisted <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Candidates</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg max-w-2xl">
                        Review high-potential matches and schedule interviews directly from this panel.
                    </p>
                </div>

                <div className="flex gap-4">
                    {/* Stats Cards */}
                    <div className="hidden md:flex gap-4 mr-4">
                        <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Scheduled</span>
                            <span className="text-2xl font-black text-slate-900">{scheduledCount}</span>
                        </div>
                        <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Avg Match</span>
                            <span className="text-2xl font-black text-slate-900">{avgScore}%</span>
                        </div>
                    </div>

                    <button
                        onClick={downloadCSV}
                        disabled={candidates.length === 0}
                        className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-3xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:bg-slate-200 disabled:shadow-none h-fit self-center active:scale-95"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export Details
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold tracking-wide animate-pulse">Identifying top talent...</p>
                </div>
            ) : candidates.length === 0 ? (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[40px] p-24 text-center border border-dashed border-slate-200 shadow-sm"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Award className="w-12 h-12 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">No Shortlisted Profile Yet</h2>
                    <p className="text-slate-400 mt-3 max-w-md mx-auto font-medium text-lg">
                        The pipeline is empty. Use the AI screening tool to find and rank the best candidates.
                    </p>
                    <button className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
                        Go to Screening Pipeline
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {candidates.map((candidate, idx) => (
                        <motion.div
                            key={candidate._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            {/* Decorative Background Header */}
                            <div className="h-32 bg-gradient-to-r from-slate-50 to-white relative p-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-[100px]"></div>

                                <div className="absolute top-6 right-6 z-10">
                                    <div className="bg-white/90 backdrop-blur-sm p-1.5 pl-2 rounded-xl flex items-center gap-1.5 shadow-sm border border-slate-100/50">
                                        <span className={`text-xl font-black ${candidate.score >= 80 ? 'text-emerald-500' :
                                            candidate.score >= 60 ? 'text-indigo-500' : 'text-amber-500'
                                            }`}>{candidate.score}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black uppercase text-slate-400 leading-none">Match</span>
                                            <span className="text-[7px] font-black uppercase text-slate-400 leading-none">Score</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex gap-4 mt-2">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center text-2xl font-black text-indigo-600 border border-slate-50">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div className="mt-1.5">
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{candidate.appliedRole || 'Full Stack Dev'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-2">
                                {/* Skills */}
                                <div className="flex flex-wrap gap-2 mb-8 min-h-[52px]">
                                    {candidate.skills.slice(0, 4).map((skill: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                    {candidate.skills.length > 4 && (
                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-100">
                                            +{candidate.skills.length - 4}
                                        </span>
                                    )}
                                </div>

                                {/* Info Grid */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <Mail size={14} />
                                        </div>
                                        <span className="truncate">{candidate.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <Phone size={14} />
                                        </div>
                                        <span>{candidate.phone || 'Not Provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <Calendar size={14} />
                                        </div>
                                        <span>{candidate.experience} Years Experience</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleSchedule(candidate)}
                                    disabled={candidate.status === 'Interview Scheduled'}
                                    className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3
                                        ${candidate.status === 'Interview Scheduled'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none cursor-default'
                                            : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30'
                                        }`}
                                >
                                    {candidate.status === 'Interview Scheduled' ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                            </div>
                                            Scheduled
                                        </>
                                    ) : (
                                        <>
                                            Schedule Interview
                                            <ChevronRight className="w-3 h-3 ml-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ShortlistedPage;
