'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, File, Image as ImageIcon, Video, Music, FileText, Archive, Download, Search, CheckCircle2 } from 'lucide-react';
import PinLock from '../components/PinLock';
import { getFullUrl } from '../lib/utils';

interface DocumentItem {
    id: string;
    title: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
    user: {
        nickname: string;
        avatarUrl: string | null;
    };
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const unlocked = sessionStorage.getItem('documents_unlocked');
            if (unlocked === 'true') {
                setIsUnlocked(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!isUnlocked) return;

        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/documents`);
                if (!res.ok) throw new Error('Failed to fetch documents');

                const data = await res.json();
                setDocuments(data);
            } catch (err) {
                console.error('Error fetching documents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [isUnlocked]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, documents]);

    const parseFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        const size = 32;
        if (fileType.includes('image')) return <ImageIcon size={size} className="text-blue-400" />;
        if (fileType.includes('video')) return <Video size={size} className="text-purple-400" />;
        if (fileType.includes('audio')) return <Music size={size} className="text-pink-400" />;
        if (fileType.includes('pdf')) return <FileText size={size} className="text-red-400" />;
        if (fileType.includes('zip') || fileType.includes('tar') || fileType.includes('rar')) return <Archive size={size} className="text-orange-400" />;
        return <File size={size} className="text-stone-400" />;
    };

    const handleDownload = async (doc: DocumentItem) => {
        try {
            setDownloadingId(doc.id);
            const fileUrl = getFullUrl(doc.filePath);

            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            // พยายามสร้างชื่อไฟล์จาก URL สมมติ หรือใช้ชื่อที่ผู้ใช้ตั้ง
            const extension = doc.filePath.split('.').pop() || 'bin';
            link.download = `${doc.title}.${extension}`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
        } finally {
            setDownloadingId(null);
        }
    };

    if (!isUnlocked) {
        return (
            <PinLock
                onUnlock={() => {
                    setIsUnlocked(true);
                    sessionStorage.setItem('documents_unlocked', 'true');
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F4] font-sans selection:bg-[#C5A059]/30">

            {/* Header Section */}
            <div className="pt-32 pb-12 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-stone-800 tracking-tight mb-4 uppercase">
                    Secret <span className="text-[#C5A059]">Vault</span>
                </h1>
                <p className="text-stone-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                    The ultimate vault for confidential and important documents. <br className="hidden md:block" />
                    Keep them safe, secure, and always accessible.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20">

                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-10 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400 group-focus-within:text-[#C5A059] transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all placeholder:text-stone-400 text-stone-700 font-medium"
                        placeholder="Search documents by name or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Documents Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-60 text-stone-400 gap-3">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm font-medium tracking-widest uppercase">Unlocking Vault...</span>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center text-stone-400 py-20 bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-4">
                        <Archive size={48} className="text-stone-200" />
                        <p className="font-medium">The vault is empty or no files match your search. 📄</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 space-y-0">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="group relative bg-white border border-stone-100 rounded-3xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                                        {getFileIcon(doc.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="font-bold text-stone-800 text-base truncate group-hover:text-[#C5A059] transition-colors" title={doc.title}>
                                            {doc.title}
                                        </h3>
                                        <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">
                                            {parseFileSize(doc.fileSize)} • {doc.fileType.split('/')[1] || doc.fileType}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {doc.user?.avatarUrl ? (
                                            <img src={getFullUrl(doc.user.avatarUrl)} alt={doc.user.nickname} className="w-6 h-6 rounded-full object-cover border border-stone-200" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500">
                                                {doc.user.nickname?.charAt(0)}
                                            </div>
                                        )}
                                        <span className="text-xs font-medium text-stone-500 truncate max-w-[100px]">{doc.user.nickname}</span>
                                        <span className="text-stone-300 text-xs mx-1">•</span>
                                        <span className="text-xs text-stone-400">
                                            {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(doc)}
                                        disabled={downloadingId === doc.id}
                                        className="w-10 h-10 shrink-0 rounded-xl bg-stone-50 hover:bg-[#C5A059] hover:text-white text-stone-500 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:hover:bg-stone-50 disabled:hover:text-stone-500"
                                    >
                                        {downloadingId === doc.id ? (
                                            <Loader2 size={18} className="animate-spin text-[#C5A059]" />
                                        ) : (
                                            <Download size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
