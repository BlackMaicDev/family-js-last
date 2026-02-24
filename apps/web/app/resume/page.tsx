'use client';

import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
    Mail, Phone, MapPin, Github, Linkedin, Briefcase,
    GraduationCap, Code2, User, Trophy, Download,
    ChevronRight, Terminal, Globe, Layout, Database,
    Wrench, Coffee
} from 'lucide-react';
import Image from 'next/image';
import { getFullUrl } from '@/app/lib/utils';
import Link from 'next/link';

export default function ResumePage() {
    const { t } = useLanguage();
    const resumeRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const [experiences, setExperiences] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [educations, setEducations] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

                // Use Promise.all to fetch all at once
                const [expRes, projRes, profRes, eduRes] = await Promise.all([
                    axios.get(`${API_URL}/experiences`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/projects`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/profiles`).catch(() => ({ data: null })),
                    axios.get(`${API_URL}/educations`).catch(() => ({ data: [] }))
                ]);

                setExperiences(expRes.data || []);
                setProjects(projRes.data || []);
                setProfile(profRes.data || null);
                setEducations(eduRes.data || []);
            } catch (error) {
                console.error('Error fetching resume data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1c1917] font-sans selection:bg-[#C5A059]/20 selection:text-[#8A6E3E] transition-colors duration-500 py-24 px-4 sm:px-8">

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-stone-500/5 dark:bg-stone-400/5 rounded-full blur-[120px] animate-float"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10 flex justify-end mb-6 print:hidden animate-in fade-in slide-in-from-top-10 duration-700">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold rounded-full hover:bg-[#C5A059] dark:hover:bg-[#C5A059] transition-all hover:scale-105 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                >
                    <Download size={16} />
                    Print / Save PDF
                </button>
            </div>

            <div
                ref={resumeRef}
                className="max-w-5xl mx-auto bg-white/80 dark:bg-[#292524]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/50 dark:border-stone-700/50 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-1000 print:shadow-none print:border-none print:bg-white"
            >
                {/* Top Header Pattern */}
                <div className="h-4 w-full bg-gradient-to-r from-[#C5A059] via-[#E2C992] to-[#C5A059] print:hidden"></div>

                <div className="flex flex-col md:flex-row print:flex-row print:bg-white print:text-black">
                    {/* LEFT COLUMN - Profile & Sidebar */}
                    <div className="w-full md:w-[35%] bg-stone-50/50 dark:bg-stone-900/30 print:bg-stone-50 p-8 md:p-10 border-r border-stone-200/50 dark:border-stone-700/50 flex flex-col gap-10">

                        {/* Photo & Identity */}
                        <div className="flex flex-col items-center md:items-start space-y-5">
                            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-stone-800 shadow-xl group print:shadow-none print:border-stone-200">
                                <Image
                                    src={profile?.avatarUrl ? getFullUrl(profile.avatarUrl) : '/images/logo1.png'}
                                    alt="Profile"
                                    fill
                                    className="object-cover object-[center_15%] group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="text-center md:text-left print:text-left text-stone-800 dark:text-stone-100">
                                <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 print:text-stone-900 tracking-tight leading-none mb-2">
                                    {profile?.user?.nickname ? profile.user.nickname.toUpperCase() : 'FAMILY JS'}
                                </h1>
                                <h2 className="text-[#C5A059] font-bold tracking-widest uppercase text-sm print:text-[#C5A059]">Full Stack Developer</h2>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 text-stone-600 dark:text-stone-300 print:text-stone-700">
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 print:bg-white border print:border-stone-200 shadow-sm flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                                    <Mail size={14} />
                                </div>
                                <span className="text-sm font-medium">{profile?.user?.email || 'hello@family-js.com'}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 print:bg-white border print:border-stone-200 shadow-sm flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                                    <Globe size={14} />
                                </div>
                                <span className="text-sm font-medium">www.family-js.com</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 print:bg-white border print:border-stone-200 shadow-sm flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                                    <MapPin size={14} />
                                </div>
                                <span className="text-sm font-medium">Lamphun, Thailand</span>
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 print:text-stone-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
                                <GraduationCap className="text-[#C5A059]" size={20} /> Education
                            </h3>
                            <div className="relative pl-4 border-l-2 border-stone-200 dark:border-stone-700 print:border-stone-300 space-y-6">
                                {loading ? (
                                    <div className="text-stone-400 text-sm animate-pulse">Loading education...</div>
                                ) : educations.length > 0 ? (
                                    educations.map((edu) => (
                                        <div key={edu.id} className="relative">
                                            <span className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-[#C5A059] border-2 border-white dark:border-stone-900 print:border-white"></span>
                                            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 print:text-stone-800">
                                                {edu.degree}{edu.field ? ` (${edu.field})` : ''}
                                            </h4>
                                            <p className="text-xs text-[#C5A059] font-medium mb-1">
                                                {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                            </p>
                                            <p className="text-xs text-stone-500 dark:text-stone-400 print:text-stone-600">{edu.schoolName}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-stone-500 text-xs">No education listed yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 print:text-stone-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
                                <Wrench className="text-[#C5A059]" size={20} /> Core Skills
                            </h3>


                            <div className="mt-6 flex flex-wrap gap-2">
                                {['React', 'Next.js', 'NestJS', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'git'].map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-white dark:bg-stone-800 print:bg-white print:border-stone-300 text-stone-600 dark:text-stone-300 print:text-stone-700 text-xs font-bold rounded-lg border border-stone-200/50 dark:border-stone-700/50 shadow-sm print:shadow-none">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - Main Content */}
                    <div className="w-full md:w-[65%] p-8 md:p-12 lg:p-16 print:bg-white">

                        {/* About Me */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100 print:text-stone-900 flex items-center gap-3 mb-6 uppercase tracking-wider">
                                <User className="text-[#C5A059]" size={24} /> Profile
                            </h3>
                            <p className="text-stone-500 dark:text-stone-400 print:text-stone-700 leading-relaxed font-light text-sm md:text-base whitespace-pre-wrap">
                                {profile?.bio || (
                                    <>
                                        Passionate Full Stack Developer with a strong emphasis on building scalable, performant, and beautifully designed web applications.
                                        I believe that <span className="text-[#C5A059] font-medium">great code is like poetry</span>—it should be clean, expressive, and efficient.
                                        When I am not forging digital experiences, I am training my body through calisthenics, treating both the mind and the body as essential temples of human potential.
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Experience */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100 print:text-stone-900 flex items-center gap-3 mb-8 uppercase tracking-wider">
                                <Briefcase className="text-[#C5A059]" size={24} /> Experience
                            </h3>

                            <div className="space-y-10">
                                {loading ? (
                                    <div className="text-stone-400 text-sm animate-pulse">Loading experiences...</div>
                                ) : experiences.length > 0 ? (
                                    experiences.map((exp, index) => (
                                        <div key={exp.id} className="relative pl-6 border-l-2 border-stone-100 dark:border-stone-800 print:border-stone-200 group">
                                            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-stone-900 print:bg-white border-2 ${index === 0 ? 'border-[#C5A059]' : 'border-stone-300 dark:border-stone-600 print:border-stone-300'} group-hover:scale-125 transition-transform duration-300 flex items-center justify-center`}>
                                                {index === 0 && <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></span>}
                                            </span>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                                <h4 className="text-lg font-bold text-stone-800 dark:text-stone-200 print:text-stone-800">{exp.title}</h4>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block mt-2 md:mt-0 w-max ${index === 0 ? 'bg-[#C5A059]/10 text-[#C5A059] print:bg-white print:border print:border-[#C5A059] print:text-[#C5A059]' : 'bg-stone-100 dark:bg-stone-800 print:bg-white print:border print:border-stone-300 text-stone-500 dark:text-stone-400 print:text-stone-600'}`}>
                                                    {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 print:text-stone-600 mb-4 flex items-center gap-1.5">
                                                {index === 0 ? <Globe size={14} /> : <Layout size={14} />} {exp.company}
                                            </p>

                                            {exp.description && (
                                                <ul className="space-y-2">
                                                    {exp.description.split('\n').map((line: string, i: number) => line.trim() ? (
                                                        <li key={i} className="text-sm text-stone-500 dark:text-stone-400 print:text-stone-700 leading-relaxed flex items-start gap-2">
                                                            <ChevronRight size={16} className={`${index === 0 ? 'text-[#C5A059] opacity-80' : 'text-stone-400'} shrink-0 mt-0.5`} />
                                                            {line.trim()}
                                                        </li>
                                                    ) : null)}
                                                </ul>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-stone-500 text-sm">No experiences listed yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Side Projects / Accomplishments */}
                        <div>
                            <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100 print:text-stone-900 flex items-center gap-3 mb-6 uppercase tracking-wider">
                                <Terminal className="text-[#C5A059]" size={24} /> Featured Projects
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {loading ? (
                                    <div className="text-stone-400 text-sm animate-pulse">Loading projects...</div>
                                ) : projects.length > 0 ? (
                                    projects.map((proj) => (
                                        <div key={proj.id} className="group cursor-pointer">
                                            {proj.link ? (
                                                <Link href={proj.link} target="_blank" className="block p-5 rounded-2xl bg-white dark:bg-stone-800/50 print:bg-white border border-stone-100 dark:border-stone-700 print:border-stone-300 hover:border-[#C5A059]/50 transition-colors shadow-sm print:shadow-none h-full relative overflow-hidden">
                                                    {proj.imageUrl && (
                                                        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative">
                                                            <Image src={getFullUrl(proj.imageUrl)} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mb-3 mt-1">
                                                        <h4 className="font-bold text-stone-800 dark:text-stone-100 print:text-stone-800 group-hover:text-[#C5A059] transition-colors line-clamp-1">{proj.title}</h4>
                                                        <Code2 size={16} className="text-stone-400 print:text-stone-500 shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400 print:text-stone-600 leading-relaxed mb-3 line-clamp-3">
                                                        {proj.description || 'No description available.'}
                                                    </p>
                                                </Link>
                                            ) : (
                                                <div className="block p-5 rounded-2xl bg-white dark:bg-stone-800/50 print:bg-white border border-stone-100 dark:border-stone-700 print:border-stone-300 hover:border-[#C5A059]/50 transition-colors shadow-sm print:shadow-none h-full relative overflow-hidden">
                                                    {proj.imageUrl && (
                                                        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative">
                                                            <Image src={getFullUrl(proj.imageUrl)} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mb-3 mt-1">
                                                        <h4 className="font-bold text-stone-800 dark:text-stone-100 print:text-stone-800 group-hover:text-[#C5A059] transition-colors line-clamp-1">{proj.title}</h4>
                                                        <Code2 size={16} className="text-stone-400 print:text-stone-500 shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400 print:text-stone-600 leading-relaxed mb-3 line-clamp-3">
                                                        {proj.description || 'No description available.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-stone-500 text-sm">No featured projects listed yet.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer message */}
            <div className="max-w-5xl mx-auto mt-12 text-center text-sm text-stone-400 flex items-center justify-center gap-2 print:hidden pb-12 animate-in fade-in duration-1000 delay-500">
                <span>Designed with</span> <Coffee size={14} className="text-[#C5A059]" /> <span>by Family JS</span>
            </div>
        </div>
    );
}
