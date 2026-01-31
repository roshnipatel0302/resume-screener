"use client";

import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Users,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink,
    FileText,
    Activity,
    Briefcase,
    ArrowUpRight,
    Plus,
    Mail,
    TrendingUp,
    Star,
    ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DashboardPage = () => {
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchResumes = async () => {
        try {
            const response = await api.get('resumes');
            setResumes(response.data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
            toast.error("Failed to load data...");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (resumes.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Skills', 'Experience', 'Score', 'Status'];
        const csvContent = [
            headers.join(','),
            ...resumes.map(r => [
                r.name,
                r.email || '',
                r.phone || '',
                `"${r.skills.join(', ')}"`,
                r.experience,
                r.score,
                r.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'candidates_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report downloaded successfully");
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.patch(`resumes/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchResumes();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error("Status update failed");
        }
    };

    const deleteResume = async (id: string, toastId: string) => {
        try {
            await api.delete(`resumes/${id}`);
            toast.dismiss(toastId);
            toast.success('Candidate profile removed');
            fetchResumes();
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
        }
    };

    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3 min-w-[240px]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                        <Trash2 size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Delete Candidate?</h4>
                        <p className="text-xs text-slate-500">This action is permanent.</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => deleteResume(id, t.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const filteredResumes = resumes.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);
    const paginatedResumes = filteredResumes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = [
        { label: 'Total Pool', value: resumes.length, icon: Users, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
        { label: 'Shortlisted', value: resumes.filter(r => r.status === 'Shortlisted').length, icon: CheckCircle, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
        { label: 'Avg Match', value: resumes.length > 0 ? (resumes.reduce((acc, r) => acc + r.score, 0) / resumes.length).toFixed(0) + '%' : '0%', icon: Activity, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
        { label: 'Open Roles', value: 4, icon: Briefcase, color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
    ];

    const chartData = [...resumes]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(r => ({
            name: r.name.split(' ')[0],
            score: r.score
        }));

    const RankingChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        padding: '12px 16px',
                        backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 700, fontSize: '12px' }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area
                    type="monotone"
                    dataKey="score"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pb-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                        Talent<span className="text-indigo-600">AI</span> Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Overview of your recruitment pipeline and AI insights.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                        title="Export to CSV"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <Link href="/upload">
                        <button className="flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                            <Plus className="w-4 h-4 mr-2" />
                            New Upload
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start z-10 relative">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        {/* Decorative Background */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - Candidates List */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Search Bar */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search candidates by name, skills..."
                            className="flex-1 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="pr-2">
                            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-400 transition-colors">
                                <Filter size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Candidate Cards */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-slate-400 text-sm font-medium">Analyzing profiles...</p>
                                </div>
                            ) : filteredResumes.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No candidates found.</p>
                                </div>
                            ) : (
                                <>
                                    {paginatedResumes.map((resume, idx) => (
                                        <motion.div
                                            key={resume._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            layout
                                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-5 group"
                                        >
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-sm">
                                                    {resume.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{resume.name}</h3>
                                                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1"><Mail size={12} /> {resume.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Match Score */}
                                            <div className="flex flex-col items-center min-w-[100px]">
                                                <div className={`text-xl font-black ${resume.score >= 80 ? 'text-emerald-500' :
                                                    resume.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>
                                                    {resume.score}%
                                                </div>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${resume.score >= 80 ? 'bg-emerald-500' :
                                                            resume.score >= 50 ? 'bg-amber-500' : 'text-rose-500'
                                                            }`}
                                                        style={{ width: `${resume.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Skills Pills */}
                                            <div className="hidden md:flex flex-wrap gap-1.5 max-w-[200px] justify-center">
                                                {resume.skills.slice(0, 3).map((skill: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {resume.skills.length > 3 && (
                                                    <span className="text-[10px] text-slate-400 font-bold">+{resume.skills.length - 3}</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <select
                                                    value={resume.status}
                                                    onChange={(e) => handleStatusUpdate(resume._id, e.target.value)}
                                                    className={`text-xs font-bold py-2 px-3 rounded-xl appearance-none cursor-pointer outline-none transition-all ${resume.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        resume.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                            'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Shortlisted">Shortlisted</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDelete(resume._id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="flex justify-center gap-3 mt-8">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center px-4 font-bold text-slate-600 text-sm bg-white rounded-xl border border-slate-200">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column - Analytics & Insights */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Top Talent Spotlight Card (Replaces Chart) */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 rounded-bl-[100px] z-0" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Talent Spotlight</h3>
                                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                                    <Star className="w-5 h-5 fill-amber-500" />
                                </div>
                            </div>

                            {resumes.length > 0 ? (
                                (() => {
                                    const topCandidate = [...resumes].sort((a, b) => b.score - a.score)[0];
                                    return (
                                        <div className="text-center">
                                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-3xl font-black text-white mb-4 relative">
                                                {topCandidate.name.charAt(0)}
                                                <div className="absolute -bottom-3 px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-md">
                                                    #{topCandidate.score} Score
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-bold text-slate-900 truncate">{topCandidate.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{topCandidate.appliedRole || 'Star Candidate'}</p>

                                            <div className="flex gap-2 justify-center flex-wrap mb-8">
                                                {topCandidate.skills.slice(0, 3).map((s: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setSearchTerm(topCandidate.name)}
                                                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group"
                                            >
                                                View Profile
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm">No candidates yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Elite Insight Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30 group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white shadow-inner border border-white/10">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="font-extrabold text-2xl mb-2 tracking-tight">AI Insights</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium opacity-90">
                                You have <span className="text-white font-bold">{resumes.filter(r => r.score >= 80).length} high-potential</span> candidates waiting for review. The pipeline quality is trending upwards by 15% this week.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-200 group-hover:text-white transition-colors">
                                View Analytics <ArrowUpRight className="w-3 h-3" />
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl translate-y-10 -translate-x-5"></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPage;
