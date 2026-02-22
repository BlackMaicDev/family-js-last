'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ImageIcon,
    Search,
    Trash2,
    Clock,
    XCircle,
    Loader2,
    Maximize2,
    X,
} from 'lucide-react';
import { getFullUrl, compressImage } from '../../lib/utils';

interface Photo {
    id: string;
    url: string;
    caption: string | null;
    createdAt: string;
    user: { id: string; username: string; nickname: string; avatarUrl: string | null };
    album: { id: string; title: string } | null;
}

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // View full image state
    const [viewImage, setViewImage] = useState<Photo | null>(null);

    // Add photo state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ url: '', caption: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); fetchPhotos(); }, []);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/photos/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch gallery');
            setPhotos(await res.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(null);

        if (!addForm.url && !selectedFile) {
            setAddError('กรุณากรอก URL เพิ่มรูปภาพ หรือ อัปโหลดจากเครื่อง');
            return;
        }

        try {
            setAddLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');

            let finalUrl = addForm.url;

            // ถ้ามีไฟล์ให้อัปโหลดไฟล์ก่อน
            if (selectedFile) {
                // บีบอัดภาพก่อนอัพโหลด
                const compressedFile = await compressImage(selectedFile, { maxSize: 1920, quality: 0.8 }) as File;
                const formData = new FormData();
                formData.append('folder', 'photos');
                formData.append('file', compressedFile);

                const uploadRes = await fetch(`${apiUrl}/uploads`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const data = await uploadRes.json();
                    throw new Error(data.message || 'อัปโหลดรูปภาพไม่สำเร็จ');
                }

                const uploadData = await uploadRes.json();
                finalUrl = uploadData.url;
            }

            const res = await fetch(`${apiUrl}/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ url: finalUrl, caption: addForm.caption }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'บันทึกรูปภาพไม่สำเร็จ');
            }

            // Successfully added
            await fetchPhotos(); // Refresh list to get the new photo with all relations
            setShowAddModal(false);
            setAddForm({ url: '', caption: '' });
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err: unknown) {
            setAddError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกภาพ');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleteLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/photos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            setPhotos((prev) => prev.filter((p) => p.id !== id));
            setDeleteConfirmId(null);
        } catch {
            alert('ลบไม่สำเร็จ');
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredPhotos = useMemo(() => {
        let result = [...photos];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((p) =>
                (p.caption && p.caption.toLowerCase().includes(q)) ||
                p.user.nickname.toLowerCase().includes(q) ||
                (p.album && p.album.title.toLowerCase().includes(q))
            );
        }
        return result;
    }, [photos, searchQuery]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setViewImage(null);
            setDeleteConfirmId(null);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Gallery</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการรูปภาพทั้งหมดในระบบ • {photos.length} รูป</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
                >
                    <ImageIcon size={16} /> Add Photo
                </button>
            </div>

            {/* ===== Filters ===== */}
            <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}
            >
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                    <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                    <input type="text" placeholder="ค้นหาด้วยคำบรรยาย, ผู้อัปโหลด, อัลบั้ม..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
                </div>
            </div>

            {/* ===== Gallery Grid ===== */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดรูปภาพ...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <XCircle size={40} className="text-red-400 mb-4" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                    <button onClick={fetchPhotos} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all">ลองใหม่อีกครั้ง</button>
                </div>
            ) : filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--admin-hover)' }}>
                        <ImageIcon size={32} style={{ color: 'var(--admin-muted)' }} />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>ไม่พบรูปภาพ</p>
                    {searchQuery && <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>ลองเปลี่ยนคำค้นหา</p>}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPhotos.map((photo, i) => (
                        <div
                            key={photo.id}
                            className="group relative rounded-2xl overflow-hidden aspect-square flex flex-col justify-end"
                            style={{
                                backgroundColor: 'var(--admin-card)',
                                border: '1px solid var(--admin-border)',
                                animation: mounted ? `card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 40}ms both` : 'none'
                            }}
                        >
                            <img
                                src={getFullUrl(photo.url)}
                                alt={photo.caption || 'image'}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Tools Overlay */}
                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => setViewImage(photo)}
                                    className="p-1.5 rounded-lg bg-black/50 backdrop-blur text-white hover:bg-black/70 transition-all"
                                >
                                    <Maximize2 size={14} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(photo.id)}
                                    className="p-1.5 rounded-lg bg-red-500/80 backdrop-blur text-white hover:bg-red-500 transition-all shadow-lg"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Details Overlay */}
                            <div className="relative p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                <div className="flex items-center gap-2 mb-1.5">
                                    {photo.user.avatarUrl ? (
                                        <img src={getFullUrl(photo.user.avatarUrl)} alt="" className="w-5 h-5 rounded-full object-cover border border-white/20" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white border border-white/20">
                                            {photo.user.nickname[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-white drop-shadow-md truncate">{photo.user.nickname}</span>
                                </div>

                                {photo.album && (
                                    <p className="text-[10px] text-white/80 line-clamp-1 mb-1 font-medium bg-black/40 inline-block px-1.5 rounded backdrop-blur-sm">
                                        📁 {photo.album.title}
                                    </p>
                                )}

                                <div className="flex items-center text-[10px] text-white/60 gap-1 mt-1">
                                    <Clock size={10} />
                                    {new Date(photo.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== Full Image Modal ===== */}
            {viewImage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setViewImage(null)} />

                    <button
                        onClick={() => setViewImage(null)}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10 animate-fade-in"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center animate-modal-enter">
                        <img
                            src={getFullUrl(viewImage.url)}
                            alt={viewImage.caption || ''}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        {(viewImage.caption || viewImage.album) && (
                            <div className="mt-4 text-center max-w-2xl bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                {viewImage.caption && <p className="text-white text-sm md:text-base font-medium mb-1">{viewImage.caption}</p>}
                                {viewImage.album && <p className="text-white/60 text-xs">จากอัลบั้ม: {viewImage.album.title}</p>}
                            </div>
                        )}
                        <div className="absolute bottom-4 right-0 translate-y-full pt-4 flex items-center gap-2 text-white/70 text-xs">
                            <span>อัปโหลดโดย {viewImage.user.nickname}</span>
                            <span>•</span>
                            <span>{new Date(viewImage.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !deleteLoading && setDeleteConfirmId(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>ลบรูปภาพนี้?</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>การกระทำนี้ไม่สามารถย้อนกลับได้ รูปภาพจะถูกลบออกจากฐานข้อมูลถาวร</p>
                        <div className="flex gap-3">
                            <button disabled={deleteLoading} onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50" style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>ยกเลิก</button>
                            <button disabled={deleteLoading} onClick={() => handleDelete(deleteConfirmId)} className="flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-70">
                                {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                                ลบเลย
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Add Photo Modal ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !addLoading && setShowAddModal(false)} />
                    <div className="relative rounded-2xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
                                    <ImageIcon size={16} />
                                </div>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>Add New Photo</h2>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)} disabled={addLoading}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--admin-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPhoto} className="p-5 space-y-4">
                            {addError && (
                                <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-xs font-semibold">
                                    <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{addError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    Photo File or URL <span className="text-red-400">*</span>
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setAddForm({ ...addForm, url: '' }); // Clear url input if file selected

                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setPreviewUrl(event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }
                                        }}
                                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C5A059]/10 file:text-[#C5A059] hover:file:bg-[#C5A059]/20 transition-all cursor-pointer"
                                        style={{ color: 'var(--admin-fg)' }}
                                    />
                                    <div className="flex items-center gap-2" style={{ color: 'var(--admin-muted)' }}>
                                        <div className="flex-1 h-px bg-[var(--admin-border)]" />
                                        <span className="text-xs">OR</span>
                                        <div className="flex-1 h-px bg-[var(--admin-border)]" />
                                    </div>
                                    <input
                                        type="url"
                                        value={addForm.url} onChange={e => {
                                            setAddForm({ ...addForm, url: e.target.value });
                                            if (e.target.value) {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                // Clear file input visually
                                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                                if (fileInput) fileInput.value = '';
                                            }
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                    />
                                </div>
                                {(previewUrl || addForm.url) && (
                                    <div className="mt-3 aspect-video rounded-xl overflow-hidden border" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-hover)' }}>
                                        <img src={getFullUrl(previewUrl || addForm.url)} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    Caption (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={addForm.caption} onChange={e => setAddForm({ ...addForm, caption: e.target.value })}
                                    placeholder="Enter caption..."
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2" style={{ borderTop: '1px dashed var(--admin-border)' }}>
                                <button
                                    type="button" onClick={() => setShowAddModal(false)} disabled={addLoading}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                    style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)' }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit" disabled={addLoading}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
                                >
                                    {addLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                    เพิ่มรูปภาพ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease forwards; }
        .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
        </div>
    );
}
