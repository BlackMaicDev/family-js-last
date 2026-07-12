'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Users,
    Loader2,
    X,
    XCircle,
    ArrowUpDown,
    CheckCircle,
    UserX
} from 'lucide-react';

interface Ward {
    id: string;
    name: string;
}

interface Nurse {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    position: string;
    isActive: boolean;
    wardId: string;
    ward?: Ward;
}

export default function NursesPage() {
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [mounted, setMounted] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formEmployeeId, setFormEmployeeId] = useState('');
    const [formFirstName, setFormFirstName] = useState('');
    const [formLastName, setFormLastName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPosition, setFormPosition] = useState('RN');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formWardId, setFormWardId] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete modal
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [nursesRes, wardsRes] = await Promise.all([
                fetch(`${apiUrl}/nurse/nurses`, { credentials: 'include' }),
                fetch(`${apiUrl}/nurse/wards`, { credentials: 'include' })
            ]);
            
            if (!nursesRes.ok) throw new Error('Failed to fetch nurses');
            if (!wardsRes.ok) throw new Error('Failed to fetch wards');
            
            const nursesData = await nursesRes.json();
            const wardsData = await wardsRes.json();
            
            setNurses(nursesData);
            setWards(wardsData);
            if (wardsData.length > 0) {
                setFormWardId(wardsData[0].id);
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormEmployeeId('');
        setFormFirstName('');
        setFormLastName('');
        setFormPhone('');
        setFormPosition('RN');
        setFormIsActive(true);
        if (wards.length > 0) setFormWardId(wards[0].id);
        setFormError(null);
        setShowModal(true);
    };

    const openEditModal = (nurse: Nurse) => {
        setEditingId(nurse.id);
        setFormEmployeeId(nurse.employeeId);
        setFormFirstName(nurse.firstName);
        setFormLastName(nurse.lastName);
        setFormPhone(nurse.phone || '');
        setFormPosition(nurse.position);
        setFormIsActive(nurse.isActive);
        setFormWardId(nurse.wardId);
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formEmployeeId.trim() || !formFirstName.trim() || !formLastName.trim() || !formWardId) {
            setFormError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        try {
            setSaving(true);
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId ? `${apiUrl}/nurse/nurses/${editingId}` : `${apiUrl}/nurse/nurses`;

            const payload = {
                employeeId: formEmployeeId.trim(),
                firstName: formFirstName.trim(),
                lastName: formLastName.trim(),
                phone: formPhone.trim() || null,
                position: formPosition.trim(),
                isActive: formIsActive,
                wardId: formWardId
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                const msg = errBody?.message
                    ? (Array.isArray(errBody.message) ? errBody.message.join(', ') : errBody.message)
                    : `Failed to save nurse (${res.status})`;
                throw new Error(msg);
            }

            await fetchData();
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${apiUrl}/nurse/nurses/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                const msg = errBody?.message || 'ลบไม่สำเร็จ';
                throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
            }
            // Backend currently soft deletes, so we should refetch
            await fetchData();
            setDeleteConfirmId(null);
        } catch (err: any) {
            alert(err.message || 'ลบไม่สำเร็จ');
        }
    };

    const filteredNurses = useMemo(() => {
        let result = [...nurses];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n) => n.firstName.toLowerCase().includes(q) || 
                       n.lastName.toLowerCase().includes(q) || 
                       n.employeeId.toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`;
            const nameB = `${b.firstName} ${b.lastName}`;
            const cmp = nameA.localeCompare(nameB);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [nurses, searchQuery, sortDir]);

    const toggleSort = () => {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl md:text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-fg)' }}
                    >
                        พยาบาล
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
                        จัดการข้อมูลพยาบาล • {nurses.length} คน
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/25 hover:scale-[1.02]"
                >
                    <Plus size={18} /> เพิ่มพยาบาล
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
                            placeholder="ค้นหาด้วยชื่อ สกุล หรือรหัสพนักงาน..."
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
                        <span style={{ color: 'var(--admin-muted)' }}>{sortDir === 'asc' ? 'ก→ฮ' : 'ฮ→ก'}</span>
                    </button>
                </div>
            </div>

            {/* ===== Nurses List ===== */}
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
                            onClick={fetchData}
                            className="mt-3 text-xs font-semibold text-[#C5A059] hover:underline"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                ) : filteredNurses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users size={32} className="mb-3" style={{ color: 'var(--admin-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>
                            ไม่พบพยาบาล
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
                                        <th className="text-left py-3.5 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            รหัสพนักงาน
                                        </th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            <button onClick={toggleSort} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                                                <span>ชื่อ-นามสกุล</span>
                                                <ArrowUpDown size={12} className="opacity-40" />
                                            </button>
                                        </th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            แผนก (Ward)
                                        </th>
                                        <th className="text-center py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            สถานะ
                                        </th>
                                        <th className="text-right py-3.5 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNurses.map((nurse, i) => (
                                        <tr
                                            key={nurse.id}
                                            className="group transition-colors duration-150"
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                animation: mounted ? `row-enter 0.4s ease ${300 + i * 50}ms both` : 'none',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-hover)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <td className="py-3.5 px-6">
                                                <span className="font-mono text-sm" style={{ color: 'var(--admin-fg)' }}>{nurse.employeeId}</span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs uppercase flex-shrink-0">
                                                        {nurse.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold block" style={{ color: 'var(--admin-fg)' }}>
                                                            {nurse.firstName} {nurse.lastName}
                                                        </span>
                                                        {nurse.phone && <span className="text-[11px] block" style={{ color: 'var(--admin-muted)' }}>{nurse.phone}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg-secondary)' }}>
                                                    {nurse.ward?.name || 'ไม่มีสังกัด'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {nurse.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-500 bg-emerald-500/10">
                                                        <CheckCircle size={12} /> ทำงานอยู่
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-red-400 bg-red-400/10">
                                                        <UserX size={12} /> ลาออก/พักงาน
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => openEditModal(nurse)}
                                                        className="p-2 rounded-lg transition-all hover:bg-blue-500/10"
                                                        style={{ color: 'var(--admin-muted)' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#60a5fa'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-muted)'; }}
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(nurse.id)}
                                                        className="p-2 rounded-lg transition-all hover:bg-red-500/10"
                                                        style={{ color: 'var(--admin-muted)' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-muted)'; }}
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
                            {filteredNurses.map((nurse, i) => (
                                <div key={nurse.id} className="p-4" style={{ borderBottom: '1px solid var(--admin-border)', animation: mounted ? `row-enter 0.4s ease ${300 + i * 50}ms both` : 'none' }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm uppercase flex-shrink-0">
                                                {nurse.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color: 'var(--admin-fg)' }}>
                                                    {nurse.firstName} {nurse.lastName}
                                                </p>
                                                <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--admin-muted)' }}>
                                                    {nurse.employeeId} • {nurse.ward?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <button onClick={() => openEditModal(nurse)} className="p-2 rounded-lg" style={{ color: 'var(--admin-muted)' }}><Edit3 size={15} /></button>
                                            <button onClick={() => setDeleteConfirmId(nurse.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                    <div className="mt-3 ml-13 flex items-center gap-2">
                                        {nurse.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-500 bg-emerald-500/10">ทำงานอยู่</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-400/10">ลาออก/พักงาน</span>
                                        )}
                                        {nurse.phone && <span className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>{nurse.phone}</span>}
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)} />
                    <div className="relative rounded-2xl w-full max-w-lg shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center">
                                    <Users size={20} className="text-[#C5A059]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>{editingId ? 'แก้ไขข้อมูลพยาบาล' : 'เพิ่มพยาบาลใหม่'}</h3>
                                    <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{editingId ? 'อัปเดตข้อมูลให้เป็นปัจจุบัน' : 'กรอกข้อมูลรายละเอียดเบื้องต้น'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--admin-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {formError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                                    <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>รหัสพนักงาน <span className="text-red-400">*</span></label>
                                    <input type="text" value={formEmployeeId} onChange={(e) => setFormEmployeeId(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} required autoFocus={!editingId} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>แผนก (Ward) <span className="text-red-400">*</span></label>
                                    <select value={formWardId} onChange={(e) => setFormWardId(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} required>
                                        <option value="" disabled>-- เลือกแผนก --</option>
                                        {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>ชื่อจริง <span className="text-red-400">*</span></label>
                                    <input type="text" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>นามสกุล <span className="text-red-400">*</span></label>
                                    <input type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>เบอร์โทรศัพท์</label>
                                    <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-muted)' }}>ตำแหน่ง</label>
                                    <input type="text" value={formPosition} onChange={(e) => setFormPosition(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input type="checkbox" id="isActive" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-transparent text-[#C5A059] focus:ring-[#C5A059]" />
                                <label htmlFor="isActive" className="text-sm cursor-pointer" style={{ color: 'var(--admin-fg)' }}>สถานะทำงานปกติ (Active)</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t mt-4" style={{ borderColor: 'var(--admin-border)' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all" style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                                    ยกเลิก
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center gap-2">
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {editingId ? 'บันทึกการแก้ไข' : 'สร้างข้อมูล'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>ระงับบัญชีนี้?</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>คุณต้องการระงับ/ลบบัญชีพยาบาลนี้ใช่หรือไม่</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all" style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>ยกเลิก</button>
                            <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">ลบข้อมูล</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes card-enter {
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes row-enter {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease forwards; }
                .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
}
