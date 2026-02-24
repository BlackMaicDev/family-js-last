'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Tag,
    Loader2,
    X,
    XCircle,
    ArrowUpDown,
    Hash,
    FileText,
    FolderOpen,
} from 'lucide-react';

// --- Types ---
interface Category {
    id: string;
    name: string;
    slug: string;
    posts?: { id: string; title: string; status: string; createdAt: string }[];
    _count?: { posts: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [mounted, setMounted] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete modal
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        setMounted(true);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${apiUrl}/categories`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (value: string) => {
        setFormName(value);
        // Only auto-generate slug if not editing or slug hasn't been manually changed
        if (!editingId) {
            setFormSlug(generateSlug(value));
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormError(null);
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingId(cat.id);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formName.trim() || !formSlug.trim()) {
            setFormError('กรุณากรอกชื่อและ slug');
            return;
        }

        // Validate slug format
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formSlug)) {
            setFormError('Slug ต้องเป็นตัวอักษรพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น');
            return;
        }

        try {
            setSaving(true);
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId ? `${apiUrl}/categories/${editingId}` : `${apiUrl}/categories`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: formName.trim(), slug: formSlug.trim() }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                const msg = errBody?.message
                    ? (Array.isArray(errBody.message) ? errBody.message.join(', ') : errBody.message)
                    : `Failed to save category (${res.status})`;
                throw new Error(msg);
            }

            await fetchCategories();
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${apiUrl}/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                const msg = errBody?.message || 'ลบไม่สำเร็จ';
                throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
            }
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setDeleteConfirmId(null);
        } catch (err: any) {
            alert(err.message || 'ลบไม่สำเร็จ');
        }
    };

    const filteredCategories = useMemo(() => {
        let result = [...categories];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            const cmp = a.name.localeCompare(b.name);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [categories, searchQuery, sortDir]);

    const toggleSort = () => {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl md:text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-fg)' }}
                    >
                        Categories
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
                        จัดการหมวดหมู่ทั้งหมด • {categories.length} หมวดหมู่
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/25 hover:scale-[1.02]"
                >
                    <Plus size={18} /> สร้างหมวดหมู่
                </button>
            </div>

            {/* ===== Search & Sort ===== */}
            <div
                className="rounded-2xl p-4 space-y-4"
                style={{
                    backgroundColor: 'var(--admin-card)',
                    border: '1px solid var(--admin-border)',
                    animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none',
                }}
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div
                        className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 group transition-all duration-300"
                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
                    >
                        <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="ค้นหาด้วยชื่อหมวดหมู่หรือ slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full"
                            style={{ color: 'var(--admin-fg)' }}
                        />
                    </div>
                    <button
                        onClick={toggleSort}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all"
                        style={{
                            color: 'var(--admin-fg-secondary)',
                            backgroundColor: 'var(--admin-hover)',
                            border: '1px solid var(--admin-border)',
                        }}
                    >
                        <ArrowUpDown size={14} />
                        ชื่อ
                        <span style={{ color: 'var(--admin-muted)' }}>{sortDir === 'asc' ? 'A→Z' : 'Z→A'}</span>
                    </button>
                </div>
            </div>

            {/* ===== Categories List ===== */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: 'var(--admin-card)',
                    border: '1px solid var(--admin-border)',
                    animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms both' : 'none',
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-[#C5A059]" />
                        <span className="ml-3 text-sm" style={{ color: 'var(--admin-muted)' }}>
                            กำลังโหลด...
                        </span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <XCircle size={32} className="text-red-400 mb-3" />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>
                            {error}
                        </p>
                        <button
                            onClick={fetchCategories}
                            className="mt-3 text-xs font-semibold text-[#C5A059] hover:underline"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FolderOpen size={32} className="mb-3" style={{ color: 'var(--admin-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>
                            ไม่พบหมวดหมู่
                        </p>
                        {searchQuery && (
                            <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>
                                ลองเปลี่ยนคำค้นหา
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <th
                                            className="text-left py-3.5 px-6 text-xs font-semibold uppercase tracking-wider w-[40%]"
                                            style={{ color: 'var(--admin-muted)' }}
                                        >
                                            <button
                                                onClick={toggleSort}
                                                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                                            >
                                                <span>ชื่อหมวดหมู่</span>
                                                <ArrowUpDown size={12} className="opacity-40" />
                                            </button>
                                        </th>
                                        <th
                                            className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider w-[30%]"
                                            style={{ color: 'var(--admin-muted)' }}
                                        >
                                            Slug
                                        </th>
                                        <th
                                            className="text-center py-3.5 px-4 text-xs font-semibold uppercase tracking-wider w-[15%]"
                                            style={{ color: 'var(--admin-muted)' }}
                                        >
                                            โพสต์
                                        </th>
                                        <th className="text-right py-3.5 px-6 w-[15%]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((cat, i) => (
                                        <tr
                                            key={cat.id}
                                            className="group transition-colors duration-150"
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                animation: mounted
                                                    ? `row-enter 0.4s ease ${300 + i * 50}ms both`
                                                    : 'none',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: 'var(--admin-active-bg)' }}
                                                    >
                                                        <Tag size={16} className="text-[#C5A059]" />
                                                    </div>
                                                    <span
                                                        className="font-semibold"
                                                        style={{ color: 'var(--admin-fg)' }}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium"
                                                    style={{
                                                        backgroundColor: 'var(--admin-hover)',
                                                        color: 'var(--admin-fg-secondary)',
                                                    }}
                                                >
                                                    <Hash size={10} className="opacity-50" />
                                                    {cat.slug}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: 'var(--admin-hover)',
                                                        color: 'var(--admin-fg-secondary)',
                                                    }}
                                                >
                                                    <FileText size={12} className="opacity-50" />
                                                    {cat.posts?.length ?? cat._count?.posts ?? 0}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => openEditModal(cat)}
                                                        className="p-2 rounded-lg transition-all hover:bg-blue-500/10"
                                                        style={{ color: 'var(--admin-muted)' }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#60a5fa';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'var(--admin-muted)';
                                                        }}
                                                        title="แก้ไข"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(cat.id)}
                                                        className="p-2 rounded-lg transition-all hover:bg-red-500/10"
                                                        style={{ color: 'var(--admin-muted)' }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#f87171';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'var(--admin-muted)';
                                                        }}
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {filteredCategories.map((cat, i) => (
                                <div
                                    key={cat.id}
                                    className="p-4 transition-colors"
                                    style={{
                                        borderBottom: '1px solid var(--admin-border)',
                                        animation: mounted
                                            ? `row-enter 0.4s ease ${300 + i * 50}ms both`
                                            : 'none',
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: 'var(--admin-active-bg)' }}
                                            >
                                                <Tag size={16} className="text-[#C5A059]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p
                                                    className="font-semibold text-sm truncate"
                                                    style={{ color: 'var(--admin-fg)' }}
                                                >
                                                    {cat.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="text-[11px] font-mono"
                                                        style={{ color: 'var(--admin-muted)' }}
                                                    >
                                                        #{cat.slug}
                                                    </span>
                                                    <span className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>
                                                        • {cat.posts?.length ?? cat._count?.posts ?? 0} โพสต์
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => openEditModal(cat)}
                                                className="p-1.5 rounded-lg transition-all"
                                                style={{ color: 'var(--admin-muted)' }}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(cat.id)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/[0.06] transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ===== Create/Edit Modal ===== */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        className="relative rounded-2xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden"
                        style={{
                            backgroundColor: 'var(--admin-card)',
                            border: '1px solid var(--admin-border)',
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            className="p-5 flex justify-between items-center"
                            style={{ borderBottom: '1px solid var(--admin-border)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center">
                                    <Tag size={20} className="text-[#C5A059]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>
                                        {editingId ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                                        {editingId ? 'อัปเดตข้อมูลหมวดหมู่' : 'กรอกข้อมูลสำหรับหมวดหมู่ใหม่'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--admin-muted)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            {formError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                                    <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Name Input */}
                            <div>
                                <label
                                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                    style={{ color: 'var(--admin-muted)' }}
                                >
                                    ชื่อหมวดหมู่ <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="เช่น Technology, Lifestyle..."
                                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C5A059]/30"
                                    style={{
                                        backgroundColor: 'var(--admin-hover)',
                                        border: '1px solid var(--admin-border)',
                                        color: 'var(--admin-fg)',
                                    }}
                                    autoFocus
                                />
                            </div>

                            {/* Slug Input */}
                            <div>
                                <label
                                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                    style={{ color: 'var(--admin-muted)' }}
                                >
                                    Slug <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                                        style={{ color: 'var(--admin-muted)' }}
                                    >
                                        #
                                    </span>
                                    <input
                                        type="text"
                                        value={formSlug}
                                        onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                                        placeholder="technology"
                                        className="w-full pl-7 pr-4 py-2.5 text-sm font-mono rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C5A059]/30"
                                        style={{
                                            backgroundColor: 'var(--admin-hover)',
                                            border: '1px solid var(--admin-border)',
                                            color: 'var(--admin-fg)',
                                        }}
                                    />
                                </div>
                                <p className="text-[11px] mt-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    ใช้สำหรับ URL เช่น /blog/category/<strong>{formSlug || 'slug'}</strong>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                                    style={{
                                        color: 'var(--admin-fg-secondary)',
                                        backgroundColor: 'var(--admin-hover)',
                                        border: '1px solid var(--admin-border)',
                                    }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : editingId ? (
                                        'อัปเดต'
                                    ) : (
                                        'สร้าง'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setDeleteConfirmId(null)}
                    />
                    <div
                        className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter"
                        style={{
                            backgroundColor: 'var(--admin-card)',
                            border: '1px solid var(--admin-border)',
                        }}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-400" />
                        </div>
                        <h3
                            className="text-lg font-bold text-center mb-2"
                            style={{ color: 'var(--admin-fg)' }}
                        >
                            ลบหมวดหมู่นี้?
                        </h3>
                        <p
                            className="text-sm text-center mb-6"
                            style={{ color: 'var(--admin-muted)' }}
                        >
                            หากมีโพสต์ที่ใช้หมวดหมู่นี้อยู่ อาจลบไม่สำเร็จ
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                                style={{
                                    color: 'var(--admin-fg-secondary)',
                                    backgroundColor: 'var(--admin-hover)',
                                    border: '1px solid var(--admin-border)',
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                                ลบเลย
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes card-enter {
                    from {
                        opacity: 0;
                        transform: translateY(16px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes row-enter {
                    from {
                        opacity: 0;
                        transform: translateX(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes modal-enter {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease forwards;
                }
                .animate-modal-enter {
                    animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>
    );
}
