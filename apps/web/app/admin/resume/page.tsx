'use client';

import React, { useState, useEffect } from 'react';
import {
    User, BookOpen, Briefcase, Camera, Loader2, Save, Plus, Edit2, Trash2, X, Check, Link as LinkIcon, Image as ImageIcon, MapPin, Mail, Phone, Calendar
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

// === Types ===
interface UserProfile {
    userId: string;
    username: string;
    nickname: string;
}

interface ProfileData {
    id?: string;
    bio: string;
    avatarUrl: string;
}

interface Education {
    id: string;
    schoolName: string;
    degree: string;
    field: string | null;
    startDate: string;
    endDate: string | null;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    link: string | null;
}

export default function ResumePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'projects'>('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // User State
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    // 1. Profile State
    const [profile, setProfile] = useState<ProfileData>({ bio: '', avatarUrl: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
    const [profileAvatarPreview, setProfileAvatarPreview] = useState<string | null>(null);

    // 2. Education State
    const [educations, setEducations] = useState<Education[]>([]);
    const [showEduModal, setShowEduModal] = useState(false);
    const [savingEdu, setSavingEdu] = useState(false);
    const [editingEduId, setEditingEduId] = useState<string | null>(null);
    const [eduForm, setEduForm] = useState({
        schoolName: '', degree: '', field: '', startDate: '', endDate: ''
    });

    // 3. Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [showProjModal, setShowProjModal] = useState(false);
    const [savingProj, setSavingProj] = useState(false);
    const [editingProjId, setEditingProjId] = useState<string | null>(null);
    const [projForm, setProjForm] = useState({
        title: '', description: '', link: '', imageUrl: ''
    });
    const [projImageFile, setProjImageFile] = useState<File | null>(null);
    const [projImagePreview, setProjImagePreview] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            // 1. Get Me
            const meRes = await fetch(`${apiUrl}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!meRes.ok) throw new Error('Failed to load user profile');
            const meData = await meRes.json();
            setCurrentUser(meData);

            const userId = meData.userId;

            // 2. Get Profile
            try {
                const profRes = await fetch(`${apiUrl}/profiles/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profRes.ok) {
                    const profData = await profRes.json();
                    if (profData) {
                        setProfile({
                            bio: profData.bio || '',
                            avatarUrl: profData.avatarUrl || ''
                        });
                        setProfileAvatarPreview(profData.avatarUrl);
                    }
                }
            } catch (err) {
                console.error('Cannot load profile details', err);
            }

            // 3. Get Educations
            const eduRes = await fetch(`${apiUrl}/educations/user/${userId}`);
            if (eduRes.ok) setEducations(await eduRes.json());

            // 4. Get Projects (Portfolio)
            const projRes = await fetch(`${apiUrl}/projects/user/${userId}`);
            if (projRes.ok) setProjects(await projRes.json());

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // === Helpers ===
    const uploadFile = async (file: File, folder: string) => {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const formData = new FormData();
        formData.append('folder', folder);
        formData.append('file', file);

        const res = await fetch(`${apiUrl}/uploads`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) throw new Error('File upload failed');
        const data = await res.json();
        return data.url;
    };

    // === Profile Handlers ===
    const handleSaveProfile = async () => {
        try {
            setSavingProfile(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');

            let finalAvatarUrl = profile.avatarUrl;
            if (profileAvatarFile) {
                finalAvatarUrl = await uploadFile(profileAvatarFile, 'profiles');
            }

            const res = await fetch(`${apiUrl}/profiles/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bio: profile.bio, avatarUrl: finalAvatarUrl })
            });

            if (!res.ok) throw new Error('Failed to save profile');

            // Re-fetch to sync
            await loadAllData();
            alert('บันทึกข้อมูลส่วนตัวสำเร็จ!');
            setProfileAvatarFile(null); // Clear pending file
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    // === Education Handlers ===
    const openEduModal = (edu?: Education) => {
        if (edu) {
            setEditingEduId(edu.id);
            setEduForm({
                schoolName: edu.schoolName,
                degree: edu.degree,
                field: edu.field || '',
                startDate: new Date(edu.startDate).toISOString().split('T')[0],
                endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingEduId(null);
            setEduForm({ schoolName: '', degree: '', field: '', startDate: '', endDate: '' });
        }
        setShowEduModal(true);
    };

    const handleSaveEdu = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingEdu(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');

            const payload = {
                schoolName: eduForm.schoolName,
                degree: eduForm.degree,
                field: eduForm.field || undefined,
                startDate: new Date(eduForm.startDate).toISOString(),
                endDate: eduForm.endDate ? new Date(eduForm.endDate).toISOString() : undefined,
            };

            const method = editingEduId ? 'PATCH' : 'POST';
            const url = editingEduId ? `${apiUrl}/educations/${editingEduId}` : `${apiUrl}/educations`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save education');

            // Refresh lists
            const eduRes = await fetch(`${apiUrl}/educations/user/${currentUser?.userId}`);
            if (eduRes.ok) setEducations(await eduRes.json());

            setShowEduModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSavingEdu(false);
        }
    };

    const handleDeleteEdu = async (id: string) => {
        if (!confirm('ยืนยันลบประวัติการศึกษานี้?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/educations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            setEducations(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert('ลบไม่สำเร็จ');
        }
    };

    // === Projects Handlers ===
    const openProjModal = (proj?: Project) => {
        if (proj) {
            setEditingProjId(proj.id);
            setProjForm({
                title: proj.title,
                description: proj.description || '',
                link: proj.link || '',
                imageUrl: proj.imageUrl || ''
            });
            setProjImagePreview(proj.imageUrl);
        } else {
            setEditingProjId(null);
            setProjForm({ title: '', description: '', link: '', imageUrl: '' });
            setProjImagePreview(null);
            setProjImageFile(null);
        }
        setShowProjModal(true);
    };

    const handleSaveProj = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingProj(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');

            let finalImgUrl = projForm.imageUrl;
            if (projImageFile) {
                finalImgUrl = await uploadFile(projImageFile, 'projects');
            }

            const payload = {
                title: projForm.title,
                description: projForm.description || undefined,
                link: projForm.link || undefined,
                imageUrl: finalImgUrl || undefined
            };

            const method = editingProjId ? 'PATCH' : 'POST';
            const url = editingProjId ? `${apiUrl}/projects/${editingProjId}` : `${apiUrl}/projects`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save project');

            // Refresh lists
            const pRes = await fetch(`${apiUrl}/projects/user/${currentUser?.userId}`);
            if (pRes.ok) setProjects(await pRes.json());

            setShowProjModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSavingProj(false);
        }
    };

    const handleDeleteProj = async (id: string) => {
        if (!confirm('ยืนยันลบผลงานนี้?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('ลบไม่สำเร็จ');
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 size={40} className="animate-spin text-[#C5A059] mb-4" />
                <p className="text-[var(--admin-muted)] font-medium">กำลังโหลดข้อมูลประวัติ...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Trash2 size={40} className="text-red-400 mb-4" />
                <p className="text-red-400 font-semibold mb-4">{error}</p>
                <button onClick={loadAllData} className="px-5 py-2 bg-[#C5A059] text-white rounded-xl">ลองใหม่</button>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile Information', icon: User },
        { id: 'education', label: 'Education', icon: BookOpen },
        { id: 'projects', label: 'Portfolio & Works', icon: Briefcase }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>My Resume / Portfolio</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการเรซูเม่ ประวัติการศึกษา และผลงานของคุณในที่เดียว</p>
                </div>
                <a href={`/portfolio/${currentUser?.username || currentUser?.userId}`} target="_blank" className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-hover)] text-[var(--admin-fg)] border border-[var(--admin-border)] rounded-xl text-sm font-semibold hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] transition-all">
                    <LinkIcon size={16} /> <span className="hidden sm:inline">ดูหน้าพอร์ตโฟลิโอของคุณ</span>
                </a>
            </div>

            {/* Resume Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ animation: mounted ? 'card-enter 0.5s ease 100ms both' : 'none' }}>

                {/* Left Sidebar Menu */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${isActive ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/20 translate-x-1' : 'bg-[var(--admin-card)] text-[var(--admin-muted)] border border-[var(--admin-border)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]'}`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : ''} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Box */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-sm overflow-hidden min-h-[500px]">

                        {/* ======================= TAB: PROFILE ======================= */}
                        {activeTab === 'profile' && (
                            <div className="p-6 md:p-8 animate-fade-in space-y-8">
                                <div className="border-b border-[var(--admin-border)] pb-4 mb-6">
                                    <h2 className="text-xl font-bold text-[var(--admin-fg)]">Profile Information</h2>
                                    <p className="text-[var(--admin-muted)] text-sm">ข้อมูลส่วนตัวเบื้องต้น แนะนำตัวเองสำหรับเรซูเม่</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Avatar Uploader */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-hover)] flex items-center justify-center overflow-hidden group">
                                            {profileAvatarPreview ? (
                                                <img src={getFullUrl(profileAvatarPreview)} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-[var(--admin-muted)]" />
                                            )}

                                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="text-white flex flex-col items-center gap-1">
                                                    <Camera size={24} />
                                                    <span className="text-xs font-semibold">Change Photo</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setProfileAvatarFile(file);
                                                            const reader = new FileReader();
                                                            reader.onload = ev => setProfileAvatarPreview(ev.target?.result as string);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-grow space-y-5">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--admin-muted)]">Username</label>
                                            <input type="text" disabled value={currentUser?.username} className="w-full rounded-xl px-4 py-2.5 text-sm bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-muted)] opacity-70 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--admin-muted)]">Bio / About Me</label>
                                            <textarea
                                                rows={5}
                                                value={profile.bio}
                                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                placeholder="เขียนแนะนำตัวเองซักเล็กน้อย..."
                                                className="w-full rounded-xl px-4 py-3 text-sm bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                                            />
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={savingProfile}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] text-white font-semibold rounded-xl text-sm shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all disabled:opacity-70"
                                            >
                                                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                Save Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======================= TAB: EDUCATION ======================= */}
                        {activeTab === 'education' && (
                            <div className="p-6 md:p-8 animate-fade-in space-y-6">
                                <div className="border-b border-[var(--admin-border)] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--admin-fg)]">Education History</h2>
                                        <p className="text-[var(--admin-muted)] text-sm">ประวัติการศึกษาของคุณ</p>
                                    </div>
                                    <button
                                        onClick={() => openEduModal()}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C5A059] text-white text-xs font-semibold rounded-lg hover:bg-[#b58d60] transition-colors shadow-sm"
                                    >
                                        <Plus size={14} /> Add Education
                                    </button>
                                </div>

                                {educations.length === 0 ? (
                                    <div className="py-16 text-center text-[var(--admin-muted)]">
                                        <div className="w-16 h-16 rounded-full bg-[var(--admin-hover)] flex items-center justify-center mx-auto mb-3">
                                            <BookOpen size={24} />
                                        </div>
                                        <p>ยังไม่มีประวัติการศึกษา</p>
                                        <button onClick={() => openEduModal()} className="mt-2 text-sm text-[#C5A059] font-medium hover:underline">เพิ่มประวัติการศึกษาเลย</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--admin-border)] before:to-transparent">
                                        {/* Timeline rendering */}
                                        {educations.map((edu, idx) => (
                                            <div key={edu.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                                {/* Timeline dot */}
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--admin-card)] bg-[#C5A059] text-white shadow shadow-[#C5A059]/30 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                    <BookOpen size={14} />
                                                </div>

                                                {/* Card */}
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-[var(--admin-hover)] border border-[var(--admin-border)] shadow-sm hover:border-[#C5A059]/50 transition-colors">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-[var(--admin-fg)] text-lg leading-tight">{edu.degree} {edu.field && `( ${edu.field} )`}</h3>
                                                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEduModal(edu)} className="p-1.5 rounded-md hover:bg-[var(--admin-bg)] text-[var(--admin-muted)] hover:text-blue-400"><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDeleteEdu(edu.id)} className="p-1.5 rounded-md hover:bg-[var(--admin-bg)] text-[var(--admin-muted)] hover:text-red-400"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#b58d60] mb-2">{edu.schoolName}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-[var(--admin-muted)] bg-[var(--admin-bg)] inline-flex px-2 py-1 rounded-md">
                                                        <Calendar size={12} />
                                                        <span>{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'ปัจจุบัน'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ======================= TAB: PROJECTS ======================= */}
                        {activeTab === 'projects' && (
                            <div className="p-6 md:p-8 animate-fade-in space-y-6">
                                <div className="border-b border-[var(--admin-border)] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--admin-fg)]">Portfolio & Projects</h2>
                                        <p className="text-[var(--admin-muted)] text-sm">ผลงานเด่นที่ผ่านมาของคุณ</p>
                                    </div>
                                    <button
                                        onClick={() => openProjModal()}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C5A059] text-white text-xs font-semibold rounded-lg hover:bg-[#b58d60] transition-colors shadow-sm"
                                    >
                                        <Plus size={14} /> Add Project
                                    </button>
                                </div>

                                {projects.length === 0 ? (
                                    <div className="py-16 text-center text-[var(--admin-muted)]">
                                        <div className="w-16 h-16 rounded-full bg-[var(--admin-hover)] flex items-center justify-center mx-auto mb-3">
                                            <Briefcase size={24} />
                                        </div>
                                        <p>ยังไม่มีโปรเจกต์หรือผลงาน</p>
                                        <button onClick={() => openProjModal()} className="mt-2 text-sm text-[#C5A059] font-medium hover:underline">คลิกเพื่อเพิ่มผลงานแรกตั้งโชว์เลย</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {projects.map(proj => (
                                            <div key={proj.id} className="group relative bg-[var(--admin-hover)] rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                                {/* Image Area */}
                                                <div className="h-40 bg-[var(--admin-bg)] relative overflow-hidden flex items-center justify-center">
                                                    {proj.imageUrl ? (
                                                        <img src={getFullUrl(proj.imageUrl)} alt={proj.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={32} className="text-[var(--admin-border)]" />
                                                    )}
                                                    {/* Hover Overlay Buttons */}
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                                                        <button onClick={() => openProjModal(proj)} className="p-2 rounded-lg bg-black/60 text-white hover:bg-black backdrop-blur-sm"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteProj(proj.id)} className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm shadow shadow-red-500/30"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                {/* Content Area */}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-[var(--admin-fg)] text-lg leading-tight mb-1 truncate">{proj.title}</h3>
                                                    <p className="text-xs text-[var(--admin-muted)] line-clamp-2 mb-3 h-8">{proj.description || 'ไม่มีคำบรรยาย'}</p>
                                                    {proj.link && (
                                                        <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] font-semibold hover:underline bg-[#C5A059]/10 px-2 py-1 rounded">
                                                            <LinkIcon size={12} /> Visit Project
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ======================= MODALS ======================= */}

            {/* Education Modal */}
            {showEduModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !savingEdu && setShowEduModal(false)} />
                    <div className="relative w-full max-w-md bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] shadow-2xl animate-modal-enter overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center justify-between">
                            <h3 className="font-bold text-[var(--admin-fg)]">{editingEduId ? 'Edit Education' : 'Add Education'}</h3>
                            <button onClick={() => setShowEduModal(false)} className="text-[var(--admin-muted)] hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveEdu} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">School / University <span className="text-red-400">*</span></label>
                                <input required type="text" value={eduForm.schoolName} onChange={e => setEduForm({ ...eduForm, schoolName: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#C5A059] transition-colors" placeholder="e.g. Chulalongkorn University" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Degree <span className="text-red-400">*</span></label>
                                    <input required type="text" value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Bachelor's" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Field of Study</label>
                                    <input type="text" value={eduForm.field} onChange={e => setEduForm({ ...eduForm, field: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Computer Science" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Start Date <span className="text-red-400">*</span></label>
                                    <input required type="date" value={eduForm.startDate} onChange={e => setEduForm({ ...eduForm, startDate: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">End Date</label>
                                    <input type="date" value={eduForm.endDate} onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2 rounded-xl text-sm outline-none focus:border-[#C5A059]" />
                                    <p className="text-[10px] text-[var(--admin-muted)] mt-1">Leave blank if currently studying</p>
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-[var(--admin-border)]">
                                <button type="button" onClick={() => setShowEduModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--admin-muted)] bg-[var(--admin-hover)] hover:bg-[var(--admin-border)] transition-colors">Cancel</button>
                                <button type="submit" disabled={savingEdu} className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-colors disabled:opacity-70">
                                    {savingEdu ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {showProjModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !savingProj && setShowProjModal(false)} />
                    <div className="relative w-full max-w-md bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-border)] shadow-2xl animate-modal-enter overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-[var(--admin-fg)]">{editingProjId ? 'Edit Project' : 'Add Project'}</h3>
                            <button onClick={() => setShowProjModal(false)} className="text-[var(--admin-muted)] hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="overflow-y-auto shrink p-5">
                            <form id="projForm" onSubmit={handleSaveProj} className="space-y-4">
                                {/* Image Uploader */}
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Project Image</label>
                                    <label className="block w-full h-32 md:h-40 rounded-xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-hover)] relative cursor-pointer group overflow-hidden flex items-center justify-center transition-colors hover:border-[#C5A059]">
                                        {projImagePreview ? (
                                            <img src={getFullUrl(projImagePreview)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-[var(--admin-muted)] group-hover:text-[#C5A059] transition-colors">
                                                <ImageIcon size={24} />
                                                <span className="text-xs font-semibold">Upload Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                                            <Camera size={16} /> Change Cover
                                        </div>
                                        <input
                                            type="file" accept="image/*" className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setProjImageFile(file);
                                                    setProjImagePreview(URL.createObjectURL(file));
                                                    setProjForm({ ...projForm, imageUrl: '' });
                                                }
                                            }}
                                        />
                                    </label>
                                    <div className="flex items-center gap-2 my-3 text-[var(--admin-muted)]">
                                        <div className="flex-1 h-px bg-[var(--admin-border)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">OR</span>
                                        <div className="flex-1 h-px bg-[var(--admin-border)]" />
                                    </div>
                                    <input type="url" placeholder="Paste Image URL..." value={projForm.imageUrl} onChange={e => { setProjForm({ ...projForm, imageUrl: e.target.value }); setProjImageFile(null); setProjImagePreview(e.target.value); }} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#C5A059]" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Project Title <span className="text-red-400">*</span></label>
                                    <input required type="text" value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. E-Commerce Website React" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Description</label>
                                    <textarea rows={3} value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#C5A059] resize-none" placeholder="Brief details about the project..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wider">Action Link (Optional)</label>
                                    <input type="url" value={projForm.link} onChange={e => setProjForm({ ...projForm, link: e.target.value })} className="w-full bg-[var(--admin-hover)] border border-[var(--admin-border)] text-[var(--admin-fg)] px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#C5A059]" placeholder="https://github.com/my-project" />
                                </div>
                            </form>
                        </div>
                        <div className="px-5 py-4 border-t border-[var(--admin-border)] flex justify-end gap-2 shrink-0 bg-[var(--admin-card)]">
                            <button type="button" onClick={() => setShowProjModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--admin-muted)] bg-[var(--admin-hover)] hover:bg-[var(--admin-border)] transition-colors">Cancel</button>
                            <button type="submit" form="projForm" disabled={savingProj} className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-colors disabled:opacity-70">
                                {savingProj ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease forwards; }
        .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
