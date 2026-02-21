'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Edit3,
    Trash2,
    FileText,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    X,
    AlignRight,
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

// --- Types ---
interface Post {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
    rating: number | null;
    bookAuthor: string | null;
    categoryId: string;
    authorId: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: { id: string; username: string; nickname: string; avatarUrl: string | null };
    category: { id: string; name: string; slug: string };
}

const statusConfig = {
    PUBLISHED: { label: 'Published', icon: CheckCircle2, bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500', dotClass: 'bg-emerald-500' },
    DRAFT: { label: 'Draft', icon: FileText, bgClass: 'bg-stone-500/10', textClass: 'text-stone-400', dotClass: 'bg-stone-400' },
    PENDING: { label: 'Pending', icon: AlertCircle, bgClass: 'bg-amber-500/10', textClass: 'text-amber-500', dotClass: 'bg-amber-500' },
    REJECTED: { label: 'Rejected', icon: XCircle, bgClass: 'bg-red-500/10', textClass: 'text-red-400', dotClass: 'bg-red-400' },
};

const ITEMS_PER_PAGE = 10;

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'createdAt' | 'title'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/posts`);
            if (!res.ok) throw new Error('Failed to fetch posts');
            setPosts(await res.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setDeleteConfirmId(null);
        } catch { alert('ลบไม่สำเร็จ'); }
    };

    const filteredPosts = useMemo(() => {
        let result = [...posts];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((p) => p.title.toLowerCase().includes(q) || p.author.nickname.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q));
        }
        if (statusFilter !== 'ALL') result = result.filter((p) => p.status === statusFilter);
        result.sort((a, b) => {
            const cmp = sortField === 'createdAt' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : a.title.localeCompare(b.title);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [posts, searchQuery, statusFilter, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    const toggleSort = (field: 'createdAt' | 'title') => {
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortField(field); setSortDir('desc'); }
    };

    const stripHtml = (html: string) => { const div = document.createElement('div'); div.innerHTML = html; return div.textContent || ''; };

    const statusCounts = useMemo(() => {
        const c: Record<string, number> = { ALL: posts.length };
        posts.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
        return c;
    }, [posts]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Posts</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการเนื้อหาทั้งหมด • {posts.length} โพสต์</p>
                </div>
                <Link href="/admin/createPost" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/25 hover:scale-[1.02]">
                    <Plus size={18} /> Create Post
                </Link>
            </div>

            {/* ===== Filters ===== */}
            <div
                className="rounded-2xl p-4 space-y-4"
                style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 group transition-all duration-300" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                        <input type="text" placeholder="ค้นหาด้วยชื่อ, ผู้เขียน, หมวดหมู่..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
                    </div>
                    <button onClick={() => toggleSort('createdAt')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all"
                        style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
                    >
                        <ArrowUpDown size={14} />
                        {sortField === 'createdAt' ? 'วันที่' : 'ชื่อ'}
                        <span style={{ color: 'var(--admin-muted)' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['ALL', 'PUBLISHED', 'DRAFT', 'PENDING', 'REJECTED'].map((status) => {
                        const isActive = statusFilter === status;
                        const config = status !== 'ALL' ? statusConfig[status as keyof typeof statusConfig] : null;
                        return (
                            <button key={status} onClick={() => setStatusFilter(status)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${isActive ? (status === 'ALL' ? '' : `${config!.bgClass} ${config!.textClass}`) : ''}`}
                                style={{
                                    color: isActive ? undefined : 'var(--admin-muted)',
                                    backgroundColor: isActive && status === 'ALL' ? 'var(--admin-hover)' : undefined,
                                }}
                            >
                                {config && <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass} ${isActive ? '' : 'opacity-40'}`} />}
                                {status === 'ALL' ? 'All' : config!.label}
                                <span className={isActive ? 'opacity-80' : 'opacity-40'}>{statusCounts[status] || 0}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ===== Table ===== */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms both' : 'none' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-[#C5A059]" />
                        <span className="ml-3 text-sm" style={{ color: 'var(--admin-muted)' }}>กำลังโหลด...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <XCircle size={32} className="text-red-400 mb-3" />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                        <button onClick={fetchPosts} className="mt-3 text-xs font-semibold text-[#C5A059] hover:underline">ลองใหม่อีกครั้ง</button>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText size={32} className="mb-3" style={{ color: 'var(--admin-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>ไม่พบโพสต์</p>
                        {searchQuery && <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <th className="text-left py-3.5 px-6 text-xs font-semibold uppercase tracking-wider w-[45%]" style={{ color: 'var(--admin-muted)' }}>
                                            <button onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:opacity-70 transition-opacity"><span>Post</span><ArrowUpDown size={12} className="opacity-40" /></button>
                                        </th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Category</th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Status</th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Author</th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:opacity-70 transition-opacity"><span>Date</span><ArrowUpDown size={12} className="opacity-40" /></button>
                                        </th>
                                        <th className="text-right py-3.5 px-6 w-[60px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPosts.map((post, i) => {
                                        const sc = statusConfig[post.status];
                                        const StatusIcon = sc.icon;
                                        return (
                                            <tr key={post.id} className="group transition-colors duration-150"
                                                style={{ borderBottom: '1px solid var(--admin-border)', animation: mounted ? `row-enter 0.4s ease ${300 + i * 50}ms both` : 'none' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                <td className="py-3.5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {post.thumbnail ? (
                                                            <img src={getFullUrl(post.thumbnail)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ backgroundColor: 'var(--admin-hover)' }} />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--admin-hover)' }}>
                                                                <FileText size={16} style={{ color: 'var(--admin-muted)' }} />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-semibold truncate" style={{ color: 'var(--admin-fg)' }}>{post.title}</p>
                                                            <p className="text-xs truncate mt-0.5 max-w-[300px]" style={{ color: 'var(--admin-muted)' }}>
                                                                {stripHtml(post.content).slice(0, 80)}{stripHtml(post.content).length > 80 ? '...' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg-secondary)' }}>
                                                        {post.category.name}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${sc.bgClass} ${sc.textClass}`}>
                                                        <StatusIcon size={12} />{sc.label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        {post.author.avatarUrl ? (
                                                            <img src={getFullUrl(post.author.avatarUrl)} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C5A059] to-[#714e38] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                                                {post.author.nickname[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-xs truncate" style={{ color: 'var(--admin-fg-secondary)' }}>{post.author.nickname}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--admin-muted)' }}>
                                                        <Clock size={12} className="opacity-50" />
                                                        {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <button onClick={() => setOpenMenuId(post.id)}
                                                        className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--admin-muted)' }}>
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {paginatedPosts.map((post, i) => {
                                const sc = statusConfig[post.status];
                                return (
                                    <div key={post.id} className="p-4 transition-colors" style={{ borderBottom: '1px solid var(--admin-border)', animation: mounted ? `row-enter 0.4s ease ${300 + i * 50}ms both` : 'none' }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--admin-fg)' }}>{post.title}</p>
                                                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--admin-muted)' }}>{stripHtml(post.content).slice(0, 100)}</p>
                                                <div className="flex items-center gap-3 mt-2.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${sc.bgClass} ${sc.textClass}`}>
                                                        <div className={`w-1 h-1 rounded-full ${sc.dotClass}`} />{sc.label}
                                                    </span>
                                                    <span className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>{post.category.name}</span>
                                                    <span className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>{new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 flex-shrink-0">
                                                <Link href={`/admin/createPost?edit=${post.id}`} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--admin-muted)' }}><Edit3 size={14} /></Link>
                                                <button onClick={() => setDeleteConfirmId(post.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/[0.06] transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
                                <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ color: 'var(--admin-muted)' }}>
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage ? 'bg-[#C5A059]/15 text-[#C5A059]' : ''}`}
                                            style={page !== currentPage ? { color: 'var(--admin-muted)' } : undefined}>
                                            {page}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ color: 'var(--admin-muted)' }}>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>ลบโพสต์นี้?</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all" style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>ยกเลิก</button>
                            <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">ลบเลย</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Actions Modal ===== */}
            {openMenuId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpenMenuId(null)} />
                    <div className="relative rounded-2xl w-full max-w-sm shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--admin-border)' }}>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>Post Actions</h3>
                            <button onClick={() => setOpenMenuId(null)} className="p-1.5 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-hover)] transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-3 space-y-1">
                            <Link href={`/blog/${openMenuId}`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--admin-hover)] group" style={{ color: 'var(--admin-fg-secondary)' }} onClick={() => setOpenMenuId(null)}>
                                <div className="p-2 rounded-lg bg-[#C5A059]/10 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-white transition-colors"><Eye size={18} /></div>
                                <span className="font-semibold text-sm group-hover:text-[var(--admin-fg)]">View Post</span>
                            </Link>
                            <Link href={`/admin/createPost?edit=${openMenuId}`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--admin-hover)] group" style={{ color: 'var(--admin-fg-secondary)' }} onClick={() => setOpenMenuId(null)}>
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Edit3 size={18} /></div>
                                <span className="font-semibold text-sm group-hover:text-[var(--admin-fg)]">Edit Post</span>
                            </Link>
                            <div className="my-2 border-t" style={{ borderColor: 'var(--admin-border)' }} />
                            <button onClick={() => { setDeleteConfirmId(openMenuId); setOpenMenuId(null); }}
                                className="flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-500/[0.06] rounded-xl transition-colors w-full text-left group">
                                <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500 group-hover:text-white transition-colors"><Trash2 size={18} /></div>
                                <span className="font-semibold text-sm">Delete Post</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes row-enter { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dropdown { from { opacity: 0; transform: translateY(-4px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease forwards; }
        .animate-dropdown { animation: dropdown 0.15s ease forwards; }
        .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
        </div>
    );
}
