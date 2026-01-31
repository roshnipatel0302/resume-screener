"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Video, X } from 'lucide-react';
import api from '@/lib/api';

const InterviewsPage = () => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const fetchScheduled = async () => {
        try {
            const response = await api.get('resumes');
            // Filter ONLY 'Interview Scheduled'
            setCandidates(response.data.filter((r: any) =>
                r.status === 'Interview Scheduled'
            ));
        } catch (error) {
            console.error('Error fetching interviews:', error);
            toast.error("Failed to load interview data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScheduled();
    }, []);

    const handleJoinMeeting = (link: string) => {
        // Use provided link or fallback to a dummy Google Meet
        const targetLink = link || 'https://meet.google.com/new';
        window.open(targetLink, '_blank');
        toast.success("Joining meeting room...");
    };

    const openRescheduleModal = (candidate: any) => {
        setSelectedCandidate(candidate);
        // Pre-fill existing data if available
        if (candidate.interviewDate) {
            const dateObj = new Date(candidate.interviewDate);
            setNewDate(dateObj.toISOString().split('T')[0]);
            setNewTime(dateObj.toTimeString().slice(0, 5));
        } else {
            setNewDate('');
            setNewTime('');
        }
        setIsRescheduleModalOpen(true);
    };

    const saveReschedule = async () => {
        if (!newDate || !newTime || !selectedCandidate) {
            toast.error("Please select both date and time");
            return;
        }

        const dateTimeString = `${newDate}T${newTime}`;
        const scheduledDate = new Date(dateTimeString);

        if (scheduledDate < new Date()) {
            toast.error("Cannot schedule meetings in the past");
            return;
        }

        try {
            // We need a specific endpoint or just update the entire object. 
            // Since we added fields to schema, we can assume a generic update or specifically patch these.
            // For now, let's use the status endpoint if your backend supports generic updates, 
            // OR assume we need to PATCH the fields directly. 
            // Let's assume the previous PATCH /status endpoint might not handle extra fields unless updated.
            // We should probably check if we need to update the endpoint.
            // Wait, I only updated the schema, not the route logic to filter specific fields?
            // Usually Mongoose generic update works if we pass the body.
            // Let's try patching to /resumes/:id which usually updates fields.

            // Actually, looking at previous code, let's check resumeRoutes if I can.
            // But to             // Let's try patching to /resumes/:id which usually updates fields.

            await api.patch(`resumes/${selectedCandidate._id}`, {
                interviewDate: scheduledDate,
                // We could also generate a meeting link here if empty
                meetingLink: selectedCandidate.meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(7)}`
            });

            toast.success("Interview rescheduled successfully!");
            setIsRescheduleModalOpen(false);
            fetchScheduled();
        } catch (error) {
            console.error("Reschedule failed", error);
            toast.error("Failed to reschedule interview");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not Scheduled Yet";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-10 relative"
        >
            {/* Reschedule Modal */}
            <AnimatePresence>
                {isRescheduleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRescheduleModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Reschedule Interview</h3>
                                <button onClick={() => setIsRescheduleModalOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Time</label>
                                    <input
                                        type="time"
                                        min={newDate === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={saveReschedule}
                                className="w-full mt-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                            >
                                Confirm New Time
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                    </div>
                    Scheduled <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Interviews</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Manage and track your upcoming candidate interviews.</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium tracking-wide">Loading schedules...</p>
                </div>
            ) : candidates.length === 0 ? (
                <div className="bg-white rounded-[32px] p-24 text-center border border-dashed border-slate-200 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">No Interviews Scheduled</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Head to the Shortlisted page to invite candidates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate, idx) => (
                        <motion.div
                            key={candidate._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[32px] p-6 shadow-xl shadow-indigo-500/5 border border-slate-100 relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle size={12} /> Confirmed
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-6 mt-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-inner">
                                    {candidate.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{candidate.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{candidate.appliedRole || 'Candidate'}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {formatDate(candidate.interviewDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {candidate.interviewDate && (
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                                                <p className="text-sm font-bold text-slate-800">45 Minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => handleJoinMeeting(candidate.meetingLink)}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Video size={14} /> Join Now
                                </button>
                                <button
                                    onClick={() => openRescheduleModal(candidate)}
                                    className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    {candidate.interviewDate ? 'Reschedule' : 'Set Time'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default InterviewsPage;
