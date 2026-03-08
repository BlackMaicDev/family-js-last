'use client';

import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Plus,
    Trash2,
    Edit3,
    X,
    Loader2,
    XCircle,
    Wifi,
    WifiOff,
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryFull,
    Search,
    Clock,
    Smartphone,
    MapPin,
    Shield,
    ChevronDown,
    CheckCircle2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
interface Device {
    id: string;
    name: string;
    simNumber: string | null;
    macAddress: string | null;
    battery: number;
    isOnline: boolean;
    lastSeen: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    _count?: { locations: number; alerts: number; geofences: number };
}

// ─── Helper ──────────────────────────────────────────────────
function timeAgo(dateStr: string | null) {
    if (!dateStr) return 'ไม่เคยออนไลน์';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hrs / 24);
    return `${days} วันที่แล้ว`;
}

function BatteryIcon({ level }: { level: number }) {
    if (level <= 15) return <BatteryLow size={16} className="text-red-400" />;
    if (level <= 50) return <BatteryMedium size={16} className="text-amber-400" />;
    return <BatteryFull size={16} className="text-emerald-400" />;
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [form, setForm] = useState({ name: '', simNumber: '', macAddress: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Success toast
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => { setMounted(true); fetchDevices(); }, []);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiUrl}/devices`, { credentials: 'include' });
            if (!res.ok) throw new Error('โหลดข้อมูลอุปกรณ์ไม่สำเร็จ');
            setDevices(await res.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingDevice(null);
        setForm({ name: '', simNumber: '', macAddress: '' });
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEdit = (device: Device) => {
        setEditingDevice(device);
        setForm({
            name: device.name,
            simNumber: device.simNumber || '',
            macAddress: device.macAddress || '',
        });
        setFormError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setFormError('กรุณากรอกชื่ออุปกรณ์'); return; }
        try {
            setFormLoading(true);
            setFormError(null);

            const body: Record<string, string> = { name: form.name.trim() };
            if (form.simNumber.trim()) body.simNumber = form.simNumber.trim();
            if (form.macAddress.trim()) body.macAddress = form.macAddress.trim();

            const isEdit = !!editingDevice;
            const url = isEdit ? `${apiUrl}/devices/${editingDevice!.id}` : `${apiUrl}/devices`;
            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'บันทึกไม่สำเร็จ');
            }

            await fetchDevices();
            setShowModal(false);
            showSuccess(isEdit ? 'อัปเดตอุปกรณ์สำเร็จ!' : 'เพิ่มอุปกรณ์สำเร็จ!');
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleteLoading(true);
            const res = await fetch(`${apiUrl}/devices/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('ลบไม่สำเร็จ');
            setDevices((prev) => prev.filter((d) => d.id !== id));
            setDeleteConfirmId(null);
            showSuccess('ลบอุปกรณ์สำเร็จ!');
        } catch {
            alert('ลบอุปกรณ์ไม่สำเร็จ');
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredDevices = devices.filter((d) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return d.name.toLowerCase().includes(q)
            || (d.simNumber && d.simNumber.includes(q))
            || (d.macAddress && d.macAddress.toLowerCase().includes(q));
    });

    const onlineCount = devices.filter(d => d.isOnline).length;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-20 right-6 z-[100] animate-toast-in">
                    <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl shadow-black/40 backdrop-blur-md">
                        <CheckCircle2 size={18} /><span className="text-sm font-semibold">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>
                        Devices
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
                        จัดการอุปกรณ์ IoT Tracker ทั้งหมด • {devices.length} อุปกรณ์ • {onlineCount} ออนไลน์
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
                >
                    <Plus size={16} /> Add Device
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 50ms both' : 'none' }}>
                {[
                    { label: 'Total Devices', value: devices.length, icon: Cpu, color: '#C5A059' },
                    { label: 'Online', value: onlineCount, icon: Wifi, color: '#22c55e' },
                    { label: 'Offline', value: devices.length - onlineCount, icon: WifiOff, color: '#ef4444' },
                    { label: 'Low Battery', value: devices.filter(d => d.battery <= 20).length, icon: BatteryLow, color: '#f59e0b' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon size={20} style={{ color: stat.color }} />
                            <span className="text-2xl font-bold" style={{ color: 'var(--admin-fg)' }}>{stat.value}</span>
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                    <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                    <input type="text" placeholder="ค้นหาด้วยชื่อ, เบอร์ SIM, MAC Address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
                </div>
            </div>

            {/* Device List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดอุปกรณ์...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <XCircle size={40} className="text-red-400 mb-4" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                    <button onClick={fetchDevices} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all">ลองใหม่</button>
                </div>
            ) : filteredDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--admin-hover)' }}>
                        <Cpu size={32} style={{ color: 'var(--admin-muted)' }} />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>ไม่พบอุปกรณ์</p>
                    {!searchQuery && <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>กดปุ่ม &quot;Add Device&quot; เพื่อเพิ่มอุปกรณ์ใหม่</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredDevices.map((device, i) => (
                        <div
                            key={device.id}
                            className="group rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-black/10"
                            style={{
                                backgroundColor: 'var(--admin-card)',
                                border: '1px solid var(--admin-border)',
                                animation: mounted ? `card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 60}ms both` : 'none',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isOnline ? 'bg-emerald-500/15' : 'bg-red-500/10'}`}>
                                        <Smartphone size={20} className={device.isOnline ? 'text-emerald-400' : 'text-red-400'} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: 'var(--admin-fg)' }}>{device.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${device.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                            <span className="text-[11px] font-medium" style={{ color: device.isOnline ? '#22c55e' : '#ef4444' }}>
                                                {device.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(device)} className="p-1.5 rounded-lg hover:bg-[var(--admin-hover)] transition-colors" style={{ color: 'var(--admin-muted)' }}>
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteConfirmId(device.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BatteryIcon level={device.battery} />
                                        <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>Battery</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--admin-hover)' }}>
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${device.battery}%`,
                                                    backgroundColor: device.battery <= 15 ? '#ef4444' : device.battery <= 50 ? '#f59e0b' : '#22c55e',
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold min-w-[32px] text-right" style={{ color: 'var(--admin-fg)' }}>{device.battery}%</span>
                                    </div>
                                </div>

                                {device.simNumber && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={14} style={{ color: 'var(--admin-muted)' }} />
                                            <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>SIM</span>
                                        </div>
                                        <span className="text-xs font-mono" style={{ color: 'var(--admin-fg-secondary)' }}>{device.simNumber}</span>
                                    </div>
                                )}

                                {device.macAddress && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Cpu size={14} style={{ color: 'var(--admin-muted)' }} />
                                            <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>MAC</span>
                                        </div>
                                        <span className="text-xs font-mono" style={{ color: 'var(--admin-fg-secondary)' }}>{device.macAddress}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} style={{ color: 'var(--admin-muted)' }} />
                                        <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>Last seen</span>
                                    </div>
                                    <span className="text-xs" style={{ color: 'var(--admin-fg-secondary)' }}>{timeAgo(device.lastSeen)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== Add/Edit Modal ===== */}
            {showModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !formLoading && setShowModal(false)} />
                    <div className="relative rounded-2xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
                                    <Cpu size={16} />
                                </div>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>
                                    {editingDevice ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)} disabled={formLoading} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--admin-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {formError && (
                                <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-xs font-semibold">
                                    <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{formError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    ชื่ออุปกรณ์ <span className="text-red-400">*</span>
                                </label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น ลูกน้อย 1, Tracker รถ..."
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    เบอร์ SIM <span className="text-[10px] normal-case">(Optional)</span>
                                </label>
                                <input type="text" value={form.simNumber} onChange={(e) => setForm({ ...form, simNumber: e.target.value })} placeholder="0812345678"
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                    MAC Address <span className="text-[10px] normal-case">(Optional)</span>
                                </label>
                                <input type="text" value={form.macAddress} onChange={(e) => setForm({ ...form, macAddress: e.target.value })} placeholder="AA:BB:CC:DD:EE:FF"
                                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
                            </div>

                            <div className="pt-4 flex justify-end gap-2" style={{ borderTop: '1px dashed var(--admin-border)' }}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={formLoading}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                    style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)' }}>
                                    ยกเลิก
                                </button>
                                <button type="submit" disabled={formLoading}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all disabled:opacity-70 flex items-center gap-2">
                                    {formLoading && <Loader2 size={14} className="animate-spin" />}
                                    {editingDevice ? 'อัปเดต' : 'เพิ่มอุปกรณ์'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Modal ===== */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !deleteLoading && setDeleteConfirmId(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>ลบอุปกรณ์นี้?</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>ข้อมูล Location, Alert, Geofence ทั้งหมดที่เชื่อมกับอุปกรณ์นี้จะถูกลบด้วย</p>
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

            <style jsx>{`
                @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-enter { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                .animate-fade-in { animation: fade-in 0.2s ease forwards; }
                .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
}
