'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Search,
    Trash2,
    Clock,
    XCircle,
    Loader2,
    X,
    UploadCloud,
    Download,
    File,
    Image as ImageIcon,
    Video,
    Music,
    Archive
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

interface DocumentItem {
    id: string;
    title: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
    user: { id: string; username: string; nickname: string; avatarUrl: string | null };
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Add document state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ title: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); fetchDocuments(); }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch documents');
            const data = await res.json();
            setDocuments(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(null);

        if (!addForm.title.trim()) {
            setAddError('กรุณากรอกชื่อเอกสาร');
            return;
        }

        if (!selectedFile) {
            setAddError('กรุณาเลือกไฟล์เพื่ออัปโหลด');
            return;
        }

        try {
            setAddLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');

            // 1. Upload file
            const formData = new FormData();
            formData.append('folder', 'documents');
            formData.append('file', selectedFile);

            const uploadRes = await fetch(`${apiUrl}/uploads`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            if (!uploadRes.ok) {
                const data = await uploadRes.json();
                throw new Error(data.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
            }

            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;

            // 2. Save document data
            const res = await fetch(`${apiUrl}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: addForm.title,
                    filePath: fileUrl,
                    fileType: selectedFile.type || 'application/octet-stream',
                    fileSize: selectedFile.size,
                    isTemporary: false
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'บันทึกเอกสารไม่สำเร็จ');
            }

            // Successfully added
            await fetchDocuments();
            setShowAddModal(false);
            setAddForm({ title: '' });
            setSelectedFile(null);
        } catch (err: unknown) {
            setAddError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกเอกสาร');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleteLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/documents/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            setDocuments((prev) => prev.filter((d) => d.id !== id));
            setDeleteConfirmId(null);
        } catch {
            alert('ลบไม่สำเร็จ');
        } finally {
            setDeleteLoading(false);
        }
    };

    const parseFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('image')) return <ImageIcon size={20} className="text-blue-400" />;
        if (fileType.includes('video')) return <Video size={20} className="text-purple-400" />;
        if (fileType.includes('audio')) return <Music size={20} className="text-pink-400" />;
        if (fileType.includes('pdf')) return <FileText size={20} className="text-red-400" />;
        if (fileType.includes('zip') || fileType.includes('tar') || fileType.includes('rar')) return <Archive size={20} className="text-orange-400" />;
        return <File size={20} className="text-gray-400" />;
    };

    const filteredDocuments = useMemo(() => {
        let result = [...documents];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((d) =>
                d.title.toLowerCase().includes(q) ||
                (d.user && d.user.nickname.toLowerCase().includes(q))
            );
        }
        return result;
    }, [documents, searchQuery]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
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
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Documents</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการและแชร์เอกสารทั้งหมดในครอบครัว • {documents.length} ไฟล์</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
                >
                    <UploadCloud size={16} /> Upload Document
                </button>
            </div>

            {/* ===== Filters ===== */}
            <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}
            >
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                    <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                    <input type="text" placeholder="ค้นหาด้วยชื่อเอกสาร, ผู้อัปโหลด..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
                </div>
            </div>

            {/* ===== Document List ===== */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดเอกสาร...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <XCircle size={40} className="text-red-400 mb-4" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                    <button onClick={fetchDocuments} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all">ลองใหม่อีกครั้ง</button>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--admin-hover)' }}>
                        <FileText size={32} style={{ color: 'var(--admin-muted)' }} />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>ไม่พบเอกสาร</p>
                    {searchQuery && <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>ลองเปลี่ยนคำค้นหา</p>}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms both' : 'none' }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-hover)' }} className="text-xs uppercase tracking-wider text-[var(--admin-muted)] font-semibold">
                                <th className="p-4">Name</th>
                                <th className="p-4 hidden md:table-cell">Size</th>
                                <th className="p-4">Uploaded By</th>
                                <th className="p-4 hidden sm:table-cell">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map((doc, i) => (
                                <tr
                                    key={doc.id}
                                    style={{ borderBottom: '1px solid var(--admin-border)' }}
                                    className="hover:bg-[var(--admin-hover)] transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--admin-bg)' }}>
                                                {getFileIcon(doc.fileType)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm" style={{ color: 'var(--admin-fg)' }}>{doc.title}</p>
                                                <p className="text-xs max-w-[200px] truncate" style={{ color: 'var(--admin-muted)' }}>{doc.fileType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm hidden md:table-cell" style={{ color: 'var(--admin-fg-secondary)' }}>
                                        {parseFileSize(doc.fileSize)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {doc.user?.avatarUrl ? (
                                                <img src={getFullUrl(doc.user.avatarUrl)} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-[var(--admin-border)] flex items-center justify-center text-[10px] font-bold text-[var(--admin-fg)]">
                                                    {doc.user?.nickname?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium" style={{ color: 'var(--admin-fg)' }}>{doc.user?.nickname}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm hidden sm:table-cell" style={{ color: 'var(--admin-fg-secondary)' }}>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="opacity-70" />
                                            {new Date(doc.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={getFullUrl(doc.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-lg bg-[var(--admin-border)] text-[var(--admin-fg)] hover:bg-[#C5A059] hover:text-white transition-all shadow-sm"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button
                                                onClick={() => setDeleteConfirmId(doc.id)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !deleteLoading && setDeleteConfirmId(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>ลบเอกสารนี้?</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>การกระทำนี้ไม่สามารถย้อนกลับได้ เอกสารจะถูกลบออกจากฐานข้อมูลถาวร</p>
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

            {/* ===== Add Document Modal ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !addLoading && setShowAddModal(false)} />
                    <div className="relative rounded-2xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
                                    <UploadCloud size={16} />
                                </div>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>Upload Document</h2>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)} disabled={addLoading}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--admin-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddDocument} className="p-5 space-y-4">
                            {addError && (
                                <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-xs font-semibold">
                                    <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{addError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    Title (ชื่อเอกสาร) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                                    placeholder="เช่น สำเนาทะเบียนบ้าน, บิลค่าไฟรวม..."
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    Choose File (เลือกไฟล์) <span className="text-red-400">*</span>
                                </label>
                                <div
                                    className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors"
                                    style={{
                                        borderColor: selectedFile ? '#C5A059' : 'var(--admin-border)',
                                        backgroundColor: selectedFile ? '#C5A05910' : 'var(--admin-hover)'
                                    }}
                                >
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                // ถ้ายังไม่ได้กรอกชื่อเอกสาร ให้เอาชื่อไฟล์มาใส่ให้อัตโนมัติ (ตัดนามสกุลออก)
                                                if (!addForm.title) {
                                                    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || file.name;
                                                    setAddForm(prev => ({ ...prev, title: nameWithoutExt }));
                                                }
                                            } else {
                                                setSelectedFile(null);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {!selectedFile ? (
                                        <>
                                            <UploadCloud size={32} className="mb-2" style={{ color: 'var(--admin-muted)' }} />
                                            <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg)' }}>คลิกที่นี่เพื่อเลือกไฟล์</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>อัปโหลดได้ทุกนามสกุลไฟล์</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-[#C5A059] text-white flex items-center justify-center mb-2 shadow-lg">
                                                <FileText size={20} />
                                            </div>
                                            <p className="text-sm font-bold text-center truncate w-full px-4" style={{ color: 'var(--admin-fg)' }}>
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>
                                                {parseFileSize(selectedFile.size)}
                                            </p>
                                        </>
                                    )}
                                </div>
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
                                    บันทึกเอกสาร
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
