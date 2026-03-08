'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle,
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Clock,
    Filter,
    Loader2,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    X,
    XCircle,
    ChevronDown,
    CheckCircle2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
interface Alert {
    id: string;
    type: string;
    message: string | null;
    isResolved: boolean;
    createdAt: string;
    resolvedAt: string | null;
    device: { id: string; name: string };
}

type FilterType = 'ALL' | 'SOS' | 'LOW_BATTERY' | 'MOTION_DETECTED' | 'GEOFENCE_ENTER' | 'GEOFENCE_EXIT';
type FilterStatus = 'ALL' | 'UNRESOLVED' | 'RESOLVED';

// ─── Alert styling map ──────────────────────────────────────
const alertConfig: Record<string, { emoji: string; label: string; color: string; bgColor: string }> = {
    SOS: { emoji: '🚨', label: 'SOS', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
    LOW_BATTERY: { emoji: '🔋', label: 'Low Battery', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
    MOTION_DETECTED: { emoji: '🏃', label: 'Motion Detected', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },
    GEOFENCE_ENTER: { emoji: '📍', label: 'เข้าพื้นที่ปลอดภัย', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
    GEOFENCE_EXIT: { emoji: '⚠️', label: 'ออกนอกพื้นที่', color: '#f97316', bgColor: 'rgba(249,115,22,0.1)' },
};

function getAlertConfig(type: string) {
    return alertConfig[type] || { emoji: '🔔', label: type, color: '#C5A059', bgColor: 'rgba(197,160,89,0.1)' };
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
    return `${Math.floor(hrs / 24)} วันที่แล้ว`;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('ALL');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

    const [resolving, setResolving] = useState<string | null>(null);
    const [resolvingAll, setResolvingAll] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => { setMounted(true); fetchAlerts(); }, []);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiUrl}/alerts`, { credentials: 'include' });
            if (!res.ok) throw new Error('โหลดข้อมูลการแจ้งเตือนไม่สำเร็จ');
            setAlerts(await res.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            setResolving(id);
            const res = await fetch(`${apiUrl}/alerts/${id}/resolve`, {
                method: 'PATCH',
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true, resolvedAt: new Date().toISOString() } : a));
            showSuccess('แก้ไขสถานะสำเร็จ!');
        } catch {
            alert('ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setResolving(null);
        }
    };

    const handleResolveAll = async () => {
        try {
            setResolvingAll(true);
            const res = await fetch(`${apiUrl}/alerts/resolve-all`, {
                method: 'PATCH',
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            setAlerts(prev => prev.map(a => ({ ...a, isResolved: true, resolvedAt: new Date().toISOString() })));
            showSuccess('แก้ไขสถานะทั้งหมดสำเร็จ!');
        } catch {
            alert('ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setResolvingAll(false);
        }
    };

    const filteredAlerts = useMemo(() => {
        let result = [...alerts];

        // Filter by type
        if (filterType !== 'ALL') {
            result = result.filter(a => a.type === filterType);
        }

        // Filter by status
        if (filterStatus === 'UNRESOLVED') {
            result = result.filter(a => !a.isResolved);
        } else if (filterStatus === 'RESOLVED') {
            result = result.filter(a => a.isResolved);
        }

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.device.name.toLowerCase().includes(q) ||
                (a.message && a.message.toLowerCase().includes(q)) ||
                getAlertConfig(a.type).label.toLowerCase().includes(q)
            );
        }

        // Sort by newest first
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return result;
    }, [alerts, filterType, filterStatus, searchQuery]);

    const unresolvedCount = alerts.filter(a => !a.isResolved).length;
    const sosCount = alerts.filter(a => a.type === 'SOS' && !a.isResolved).length;

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
                        Alerts
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
                        การแจ้งเตือนจากอุปกรณ์ IoT • {alerts.length} รายการ
                        {unresolvedCount > 0 && <span className="text-red-400 ml-1">• {unresolvedCount} ยังไม่แก้ไข</span>}
                        {sosCount > 0 && <span className="text-red-500 font-bold ml-1">• {sosCount} SOS!</span>}
                    </p>
                </div>
                {unresolvedCount > 0 && (
                    <button
                        onClick={handleResolveAll}
                        disabled={resolvingAll}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-60"
                    >
                        {resolvingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={16} />}
                        Resolve All ({unresolvedCount})
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4" style={{ animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 50ms both' : 'none' }}>
                {[
                    { label: 'Total', value: alerts.length, icon: Bell, color: '#C5A059' },
                    { label: 'Unresolved', value: unresolvedCount, icon: ShieldAlert, color: '#ef4444' },
                    { label: 'SOS Active', value: sosCount, icon: AlertTriangle, color: '#dc2626' },
                    { label: 'Geofence', value: alerts.filter(a => (a.type === 'GEOFENCE_ENTER' || a.type === 'GEOFENCE_EXIT') && !a.isResolved).length, icon: Shield, color: '#f97316' },
                    { label: 'Resolved', value: alerts.filter(a => a.isResolved).length, icon: ShieldCheck, color: '#22c55e' },
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

            {/* Filters */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}>
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                        <input type="text" placeholder="ค้นหาด้วยชื่ออุปกรณ์, ข้อความ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
                    </div>

                    {/* Type filter */}
                    <div className="relative">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="appearance-none rounded-xl px-4 py-2 pr-8 text-sm outline-none cursor-pointer"
                            style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}>
                            <option value="ALL">ทุกประเภท</option>
                            <option value="SOS">🚨 SOS</option>
                            <option value="LOW_BATTERY">🔋 Low Battery</option>
                            <option value="MOTION_DETECTED">🏃 Motion</option>
                            <option value="GEOFENCE_ENTER">📍 เข้าพื้นที่</option>
                            <option value="GEOFENCE_EXIT">⚠️ ออกพื้นที่</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--admin-muted)' }} />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                            className="appearance-none rounded-xl px-4 py-2 pr-8 text-sm outline-none cursor-pointer"
                            style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}>
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="UNRESOLVED">❌ ยังไม่แก้ไข</option>
                            <option value="RESOLVED">✅ แก้ไขแล้ว</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--admin-muted)' }} />
                    </div>
                </div>
            </div>

            {/* Alert List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดการแจ้งเตือน...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <XCircle size={40} className="text-red-400 mb-4" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                    <button onClick={fetchAlerts} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all">ลองใหม่</button>
                </div>
            ) : filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--admin-hover)' }}>
                        <BellOff size={32} style={{ color: 'var(--admin-muted)' }} />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>ไม่มีการแจ้งเตือน</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>ยังไม่มีการแจ้งเตือนจากอุปกรณ์</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAlerts.map((alert, i) => {
                        const config = getAlertConfig(alert.type);
                        return (
                            <div
                                key={alert.id}
                                className={`group rounded-2xl p-4 md:p-5 transition-all ${alert.isResolved ? 'opacity-60' : ''}`}
                                style={{
                                    backgroundColor: 'var(--admin-card)',
                                    border: `1px solid ${alert.isResolved ? 'var(--admin-border)' : config.color + '30'}`,
                                    animation: mounted ? `card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${100 + i * 40}ms both` : 'none',
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bgColor }}>
                                        <span className="text-lg">{config.emoji}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold" style={{ color: config.color }}>{config.label}</span>
                                            {alert.isResolved ? (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400">Resolved</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/15 text-red-400 animate-pulse">Active</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mb-1">
                                            <Smartphone size={12} style={{ color: 'var(--admin-muted)' }} />
                                            <span className="text-xs font-semibold" style={{ color: 'var(--admin-fg)' }}>{alert.device.name}</span>
                                        </div>

                                        {alert.message && (
                                            <p className="text-xs mb-1" style={{ color: 'var(--admin-fg-secondary)' }}>{alert.message}</p>
                                        )}

                                        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--admin-muted)' }}>
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} />
                                                <span>{formatDate(alert.createdAt)}</span>
                                            </div>
                                            <span>({timeAgo(alert.createdAt)})</span>
                                            {alert.resolvedAt && (
                                                <div className="flex items-center gap-1 text-emerald-400">
                                                    <Check size={10} />
                                                    <span>แก้ไขเมื่อ {formatDate(alert.resolvedAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    {!alert.isResolved && (
                                        <button
                                            onClick={() => handleResolve(alert.id)}
                                            disabled={resolving === alert.id}
                                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                        >
                                            {resolving === alert.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
}
