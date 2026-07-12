'use client';

import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../layout';
import { Building2, Plus, Edit2, Trash2, Search, X, Loader2, Save } from 'lucide-react';

interface Ward {
    id: string;
    name: string;
    code: string;
    color: string;
    description?: string;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function WardsPage() {
    const { theme } = useAdminTheme();
    const isDark = theme === 'dark';

    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingWard, setEditingWard] = useState<Ward | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        color: '#6366f1',
        description: '',
    });

    useEffect(() => {
        fetchWards();
    }, []);

    const fetchWards = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/nurse/wards`);
            if (res.ok) {
                const data = await res.json();
                setWards(data);
            }
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (ward?: Ward) => {
        if (ward) {
            setEditingWard(ward);
            setFormData({
                name: ward.name,
                code: ward.code,
                color: ward.color,
                description: ward.description || '',
            });
        } else {
            setEditingWard(null);
            setFormData({ name: '', code: '', color: '#6366f1', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingWard(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingWard
                ? `${API_URL}/nurse/wards/${editingWard.id}`
                : `${API_URL}/nurse/wards`;
            
            const method = editingWard ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchWards();
                handleCloseModal();
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Failed to save ward:', error);
            alert('Failed to save ward. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this ward?')) return;

        try {
            const res = await fetch(`${API_URL}/nurse/wards/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setWards(wards.filter((w) => w.id !== id));
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Failed to delete'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredWards = wards.filter(
        (w) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-fg)' }}>
                        Wards Management
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
                        Manage hospital wards and departments
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#C5A059] hover:bg-[#b58d60] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40"
                >
                    <Plus size={18} />
                    <span>Add Ward</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search wards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all duration-200"
                        style={{
                            backgroundColor: 'var(--admin-bg)',
                            color: 'var(--admin-fg)',
                            border: '1px solid var(--admin-border)',
                        }}
                    />
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>
                    Total Wards: <span style={{ color: 'var(--admin-accent)' }}>{wards.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.5)' : '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Ward Info</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Code</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Color</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Description</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--admin-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: 'var(--admin-accent)' }} />
                                        <p style={{ color: 'var(--admin-muted)' }}>Loading wards...</p>
                                    </td>
                                </tr>
                            ) : filteredWards.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--admin-muted)' }}>
                                        No wards found.
                                    </td>
                                </tr>
                            ) : (
                                filteredWards.map((ward) => (
                                    <tr key={ward.id} className="group transition-colors duration-200" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ward.color + '20' }}>
                                                    <Building2 size={20} color={ward.color} />
                                                </div>
                                                <span className="font-semibold" style={{ color: 'var(--admin-fg)' }}>
                                                    {ward.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono font-medium" style={{ color: 'var(--admin-fg-secondary)' }}>
                                            {ward.code}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: ward.color }} />
                                                <span className="text-xs font-mono uppercase" style={{ color: 'var(--admin-muted)' }}>{ward.color}</span>
                                            </div>
                                        </td>
                                        <td className="p-4" style={{ color: 'var(--admin-fg-secondary)' }}>
                                            <div className="max-w-xs truncate" title={ward.description}>
                                                {ward.description || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(ward)}
                                                    className="p-2 rounded-lg transition-colors hover:bg-blue-500/10 text-blue-500"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ward.id)}
                                                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
                    >
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--admin-fg)' }}>
                                <Building2 size={20} style={{ color: 'var(--admin-accent)' }} />
                                {editingWard ? 'Edit Ward' : 'Create Ward'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                style={{ color: 'var(--admin-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col p-5 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Ward Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C5A059]/50"
                                    style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-fg)', border: '1px solid var(--admin-border)' }}
                                    placeholder="e.g. ICU, ER"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono uppercase transition-all duration-200 focus:ring-2 focus:ring-[#C5A059]/50"
                                        style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-fg)', border: '1px solid var(--admin-border)' }}
                                        placeholder="e.g. ICU-01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Theme Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            required
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <input 
                                            type="text" 
                                            value={formData.color} 
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono uppercase transition-all duration-200"
                                            style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-fg)', border: '1px solid var(--admin-border)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-[#C5A059]/50"
                                    style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-fg)', border: '1px solid var(--admin-border)' }}
                                    placeholder="Additional details..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    style={{ color: 'var(--admin-fg-secondary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b58d60] text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C5A059]/20"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Save</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
