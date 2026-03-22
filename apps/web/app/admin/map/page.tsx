'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import {
    MapPin,
    Loader2,
    XCircle,
    Wifi,
    WifiOff,
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryFull,
    RefreshCw,
    Clock,
    Smartphone,
    Navigation,
    ChevronRight,
    Shield,
    AlertTriangle,
    Cpu,
    Gauge,
    Eye,
    EyeOff,
    Radio,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
// API response format from /locations/latest
interface ApiLocationData {
    deviceId: string;
    deviceName: string;
    battery: number;
    isOnline: boolean;
    lastSeen: string | null;
    latestLocation: {
        id: string;
        lat: number;
        lng: number;
        speed: number | null;
        timestamp: string;
    } | null;
    geofences: { id: string; name: string; lat: number; lng: number; radius: number }[];
}

// Normalized format for UI
interface LocationData {
    device: {
        id: string;
        name: string;
        battery: number;
        isOnline: boolean;
        lastSeen: string | null;
        macAddress: string | null;
    };
    location: {
        id: string;
        lat: number;
        lng: number;
        speed: number | null;
        timestamp: string;
    } | null;
}

function transformApiData(data: ApiLocationData[]): LocationData[] {
    return data.map(item => ({
        device: {
            id: item.deviceId,
            name: item.deviceName,
            battery: item.battery,
            isOnline: item.isOnline,
            lastSeen: item.lastSeen,
            macAddress: null,
        },
        location: item.latestLocation,
    }));
}

interface Alert {
    id: string;
    type: string;
    message: string | null;
    isResolved: boolean;
    createdAt: string;
    device: { id: string; name: string };
}

// ─── Map Props type ──────────────────────────────────────────
interface MapViewProps {
    locations: LocationData[];
    selectedDeviceId: string | null;
    onSelectDevice: (id: string | null) => void;
}

// ─── Map Component (loaded dynamically to avoid SSR issues) ──
const MapView = dynamic<MapViewProps>(() => import('./MapView'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-card)' }}>
            <Loader2 size={32} className="animate-spin text-[#C5A059]" />
        </div>
    ),
});

// ─── Helpers ─────────────────────────────────────────────────
function timeAgo(dateStr: string | null) {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
    return `${Math.floor(hrs / 24)} วันที่แล้ว`;
}

function BatteryIcon({ level }: { level: number }) {
    if (level <= 15) return <BatteryLow size={14} className="text-red-400" />;
    if (level <= 50) return <BatteryMedium size={14} className="text-amber-400" />;
    return <BatteryFull size={14} className="text-emerald-400" />;
}

function alertTypeLabel(type: string) {
    switch (type) {
        case 'SOS': return '🚨 SOS';
        case 'LOW_BATTERY': return '🔋 Low Battery';
        case 'MOTION_DETECTED': return '🏃 Motion';
        case 'GEOFENCE_ENTER': return '📍 เข้าพื้นที่';
        case 'GEOFENCE_EXIT': return '⚠️ ออกพื้นที่';
        default: return type;
    }
}



export default function MapPage() {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const fetchData = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            const [locRes, alertRes] = await Promise.all([
                fetch(`${apiUrl}/locations/latest`, { credentials: 'include' }),
                fetch(`${apiUrl}/alerts/unresolved`, { credentials: 'include' }),
            ]);

            if (!locRes.ok) throw new Error('โหลด Location ไม่สำเร็จ');
            const locData: ApiLocationData[] = await locRes.json();
            setLocations(transformApiData(locData));

            if (alertRes.ok) {
                setAlerts(await alertRes.json());
            }

            setLastRefresh(new Date());

            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Connect to Socket.IO
        const socket = io(`${apiUrl}/locations`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });

        socket.on('location:updated', (data: ApiLocationData[]) => {
            setLocations(transformApiData(data));
            setLastRefresh(new Date());
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const selectedLocation = useMemo(() =>
        locations.find(l => l?.device?.id === selectedDevice),
        [locations, selectedDevice]
    );

    const onlineCount = locations.filter(l => l?.device?.isOnline).length;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 relative z-10" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Live Map</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>
                        ตำแหน่งอุปกรณ์แบบ Real-time • {locations.length} อุปกรณ์ • {onlineCount} ออนไลน์
                        {alerts.length > 0 && <span className="text-red-400 ml-2">• {alerts.length} แจ้งเตือน</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Socket.IO status */}
                    <div
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            socketConnected
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <Radio size={12} />
                        {socketConnected ? 'Live' : 'Disconnected'}
                    </div>

                    {/* Manual refresh */}
                    <button
                        onClick={() => { fetchData(true); }}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50"
                        style={{ color: 'var(--admin-fg-secondary)', borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'กำลังโหลด...' : 'Refresh'}
                    </button>

                    {/* Sidebar toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border md:hidden"
                        style={{ color: 'var(--admin-fg-secondary)', borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}
                    >
                        {sidebarOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Map */}
                <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--admin-border)' }}>
                    {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--admin-card)' }}>
                            <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                            <span className="text-sm" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดแผนที่...</span>
                        </div>
                    ) : error ? (
                        <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--admin-card)' }}>
                            <XCircle size={40} className="text-red-400 mb-4" />
                            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                            <button onClick={() => fetchData(true)} className="px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all">ลองใหม่</button>
                        </div>
                    ) : (
                        <MapView
                            locations={locations}
                            selectedDeviceId={selectedDevice}
                            onSelectDevice={setSelectedDevice}
                        />
                    )}
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto hidden md:flex">
                        {/* Alerts Panel */}
                        {alerts.length > 0 && (
                            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle size={16} className="text-red-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                                        Active Alerts ({alerts.length})
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-none">
                                    {alerts.slice(0, 5).map((alert) => (
                                        <div key={alert.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--admin-hover)' }}>
                                            <span className="text-xs font-semibold whitespace-nowrap">{alertTypeLabel(alert.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-medium truncate" style={{ color: 'var(--admin-fg)' }}>{alert.device.name}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>{timeAgo(alert.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Device List */}
                        <div className="flex-1 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                            <div className="p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                                <div className="flex items-center gap-2">
                                    <Cpu size={14} style={{ color: 'var(--admin-muted)' }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                        Devices ({locations.length})
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(100vh-26rem)] scrollbar-none">
                                {locations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Cpu size={24} className="mx-auto mb-2" style={{ color: 'var(--admin-muted)' }} />
                                        <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>ยังไม่มีอุปกรณ์</p>
                                    </div>
                                ) : (
                                    locations.map((loc) => (
                                        <button
                                            key={loc.device.id}
                                            onClick={() => setSelectedDevice(
                                                selectedDevice === loc.device.id ? null : loc.device.id
                                            )}
                                            className={`w-full text-left p-4 border-b transition-all ${selectedDevice === loc.device.id
                                                ? 'bg-[#C5A059]/10'
                                                : 'hover:bg-[var(--admin-hover)]'
                                                }`}
                                            style={{ borderColor: 'var(--admin-border)' }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${loc.device.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                                    <span className="text-sm font-bold" style={{ color: selectedDevice === loc.device.id ? '#C5A059' : 'var(--admin-fg)' }}>
                                                        {loc.device.name}
                                                    </span>
                                                </div>
                                                <ChevronRight size={14} className={`transition-transform ${selectedDevice === loc.device.id ? 'rotate-90 text-[#C5A059]' : ''}`} style={{ color: 'var(--admin-muted)' }} />
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--admin-muted)' }}>
                                                <div className="flex items-center gap-1">
                                                    <BatteryIcon level={loc.device.battery} />
                                                    <span>{loc.device.battery}%</span>
                                                </div>
                                                {loc.location && (
                                                    <div className="flex items-center gap-1">
                                                        <Gauge size={12} />
                                                        <span>{loc.location.speed != null ? `${loc.location.speed.toFixed(1)} km/h` : '0 km/h'}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <Clock size={10} />
                                                    <span>{timeAgo(loc.location?.timestamp || loc.device.lastSeen)}</span>
                                                </div>
                                            </div>

                                            {/* Expanded details */}
                                            {selectedDevice === loc.device.id && loc.location && (
                                                <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px dashed var(--admin-border)' }}>
                                                    <div className="flex justify-between text-[11px]">
                                                        <span style={{ color: 'var(--admin-muted)' }}>Latitude</span>
                                                        <span className="font-mono" style={{ color: 'var(--admin-fg-secondary)' }}>{loc.location.lat.toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px]">
                                                        <span style={{ color: 'var(--admin-muted)' }}>Longitude</span>
                                                        <span className="font-mono" style={{ color: 'var(--admin-fg-secondary)' }}>{loc.location.lng.toFixed(6)}</span>
                                                    </div>
                                                    {loc.device.macAddress && (
                                                        <div className="flex justify-between text-[11px]">
                                                            <span style={{ color: 'var(--admin-muted)' }}>MAC</span>
                                                            <span className="font-mono" style={{ color: 'var(--admin-fg-secondary)' }}>{loc.device.macAddress}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Last refresh info */}
                        <div className="text-center text-[10px] py-1" style={{ color: 'var(--admin-muted)' }}>
                            อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
