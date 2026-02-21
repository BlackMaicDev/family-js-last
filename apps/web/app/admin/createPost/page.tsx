'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    ArrowLeft,
    Save,
    Eye,
    Upload,
    X,
    ChevronDown,
    Star,
    Loader2,
    CheckCircle2,
    Image as ImageIcon,
    Globe,
    Lock
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--admin-muted)' }} />
        </div>
    ),
});

interface Category { id: string; name: string; slug: string; }
type PostStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

function CreatePostContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<PostStatus>('DRAFT');
    const [rating, setRating] = useState<number | null>(null);
    const [bookAuthor, setBookAuthor] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingPost, setLoadingPost] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showBookFields, setShowBookFields] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => { setMounted(true); fetchCategories(); if (editId) fetchPost(editId); }, [editId]);

    const fetchCategories = async () => {
        try { const res = await fetch(`${apiUrl}/categories`); if (res.ok) setCategories(await res.json()); } catch { } finally { setLoadingCategories(false); }
    };

    const fetchPost = async (id: string) => {
        try {
            setLoadingPost(true);
            const res = await fetch(`${apiUrl}/posts/${id}`);
            if (!res.ok) throw new Error();
            const post = await res.json();
            setTitle(post.title); setContent(post.content); setThumbnail(post.thumbnail || '');
            setThumbnailPreview(post.thumbnail || null); setStatus(post.status); setRating(post.rating);
            setBookAuthor(post.bookAuthor || ''); setCategoryId(post.categoryId);
            if (post.rating || post.bookAuthor) setShowBookFields(true);
        } catch { alert('ไม่พบโพสต์'); router.push('/admin/posts'); } finally { setLoadingPost(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const body: Record<string, unknown> = { title: title.trim(), content, status, categoryId };
            if (thumbnail) body.thumbnail = thumbnail;
            if (rating !== null && showBookFields) body.rating = rating;
            if (bookAuthor.trim() && showBookFields) body.bookAuthor = bookAuthor.trim();
            const res = await fetch(isEditMode ? `${apiUrl}/posts/${editId}` : `${apiUrl}/posts`, {
                method: isEditMode ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Failed'); }
            setSuccessMessage(isEditMode ? 'อัปเดตสำเร็จ!' : 'สร้างโพสต์สำเร็จ!');
            setTimeout(() => router.push('/admin/posts'), 1200);
        } catch (err: unknown) { alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'); } finally { setSaving(false); }
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { const url = ev.target?.result as string; setThumbnail(url); setThumbnailPreview(url); };
        reader.readAsDataURL(file); e.target.value = '';
    };

    const handleThumbnailUrl = () => { const url = prompt('Enter image URL:'); if (url) { setThumbnail(url); setThumbnailPreview(url); } };
    const removeThumbnail = () => { setThumbnail(''); setThumbnailPreview(null); };

    if (loadingPost) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[#C5A059]" />
                <span className="ml-3 text-sm" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดโพสต์...</span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-20 right-6 z-[100] animate-toast-in">
                    <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl shadow-black/40 backdrop-blur-md">
                        <CheckCircle2 size={18} /><span className="text-sm font-semibold">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' : 'none' }}>
                <div className="flex items-center gap-3">
                    <Link href="/admin/posts" className="p-2 rounded-xl transition-all" style={{ color: 'var(--admin-muted)' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--admin-muted)' }}>{isEditMode ? 'แก้ไขเนื้อหาโพสต์' : 'สร้างเนื้อหาใหม่'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => alert('Preview: Coming soon')}
                        className="px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                        style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                        <Eye size={14} /> Preview
                    </button>
                    <button type="submit" form="post-form" disabled={saving}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/10 flex items-center gap-1.5 disabled:opacity-60">
                        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {isEditMode ? 'Update' : 'Publish'}</>}
                    </button>
                </div>
            </div>

            <form id="post-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title */}
                        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อบทความ..." required
                                className="w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition-all duration-300"
                                style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                        </div>

                        {/* Content */}
                        <div style={{ animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms both' : 'none' }}>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Content <span className="text-red-400">*</span></label>
                                <span className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>คลิกที่รูปเพื่อปรับขนาด/ตำแหน่ง</span>
                            </div>
                            <RichTextEditor value={content} onChange={setContent} placeholder="เริ่มเขียนเนื้อหาบทความ..." />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Status & Category */}
                        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 150ms both' : 'none' }}>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--admin-fg)' }}>Publish Settings</h3>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Status</label>
                                <div className="relative">
                                    <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}
                                        className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}>
                                        <option value="DRAFT">📝 Draft</option>
                                        <option value="PENDING">⏳ Pending</option>
                                        <option value="PUBLISHED">✅ Published</option>
                                        <option value="REJECTED">❌ Rejected</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--admin-muted)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Category <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                                        className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}>
                                        <option value="">เลือกหมวดหมู่...</option>
                                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--admin-muted)' }} />
                                </div>
                                {loadingCategories && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: 'var(--admin-muted)' }}><Loader2 size={10} className="animate-spin" /> Loading...</p>}
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 250ms both' : 'none' }}>
                            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--admin-fg)' }}>Thumbnail</h3>
                            {thumbnailPreview ? (
                                <div className="relative group rounded-2xl overflow-hidden border-2 border-transparent transition-all">
                                    <img src={getFullUrl(thumbnailPreview)} alt="Thumbnail" className="w-full h-40 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <button type="button" onClick={removeThumbnail} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"><X size={16} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl cursor-pointer group transition-all"
                                        style={{ borderColor: 'var(--admin-border)' }}>
                                        <Upload size={24} className="mb-2 transition-colors" style={{ color: 'var(--admin-muted)' }} />
                                        <span className="text-xs transition-colors" style={{ color: 'var(--admin-muted)' }}>Click to upload</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                                    </label>
                                    <button type="button" onClick={handleThumbnailUrl}
                                        className="w-full py-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
                                        style={{ color: 'var(--admin-muted)' }}>
                                        <ImageIcon size={12} /> Or paste URL
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Book Review */}
                        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 350ms both' : 'none' }}>
                            <button type="button" onClick={() => setShowBookFields(!showBookFields)} className="w-full flex items-center justify-between text-sm font-bold transition-colors" style={{ color: 'var(--admin-fg)' }}>
                                📚 Book Review
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showBookFields ? 'rotate-180' : ''}`} style={{ color: 'var(--admin-muted)' }} />
                            </button>
                            {showBookFields && (
                                <div className="mt-4 space-y-4 animate-expand">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Book Author</label>
                                        <input type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="ชื่อผู้แต่ง..."
                                            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                            style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Rating</label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setRating(star === rating ? null : star)} className="p-1 transition-transform hover:scale-110">
                                                    <Star size={22} className={`transition-colors ${rating !== null && star <= rating ? 'fill-[#C5A059] text-[#C5A059]' : ''}`}
                                                        style={rating === null || star > rating ? { color: 'var(--admin-muted)' } : undefined} />
                                                </button>
                                            ))}
                                            {rating && <span className="ml-2 text-xs" style={{ color: 'var(--admin-muted)' }}>{rating}/5</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <style jsx>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes expand { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-expand { animation: expand 0.25s ease forwards; }
      `}</style>
        </div>
    );
}

export default function CreatePostPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#C5A059]" /></div>}>
            <CreatePostContent />
        </Suspense>
    );
}
