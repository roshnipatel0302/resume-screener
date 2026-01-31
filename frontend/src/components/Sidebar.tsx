"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UploadCloud,
    FileText,
    CheckCircle,
    Settings,
    Menu,
    X,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    // Sidebar navigation component
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(true);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Upload Resumes', href: '/upload', icon: UploadCloud },
        { name: 'Shortlisted', href: '/shortlisted', icon: CheckCircle },
        { name: 'Interviews', href: '/interviews', icon: Calendar },
        { name: 'Job Description', href: '/jd', icon: FileText },
    ];

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 backdrop-blur-xl text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-r border-white/5 md:relative md:translate-x-0`}>
                <div className="flex items-center space-x-3 h-24 px-8 border-b border-white/5">
                    <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        ResumeAI
                    </span>
                    <button onClick={() => setIsOpen(false)} className="ml-auto md:hidden text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`w-5 h-5 mr-3.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-8 left-6 right-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-400 mb-2">Need help?</p>
                        <button className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-semibold transition-all">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-40 p-2 bg-slate-900 text-white rounded-md md:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}
        </>
    );
};

export default Sidebar;
