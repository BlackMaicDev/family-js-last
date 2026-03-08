'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types (matching page.tsx) ───────────────────────────────
interface Device {
    id: string;
    name: string;
    battery: number;
    isOnline: boolean;
    lastSeen: string | null;
    macAddress: string | null;
}

interface LocationData {
    device: Device;
    location: {
        id: string;
        lat: number;
        lng: number;
        speed: number | null;
        timestamp: string;
    } | null;
}

interface MapViewProps {
    locations: LocationData[];
    selectedDeviceId: string | null;
    onSelectDevice: (id: string | null) => void;
}

// ─── Custom marker icons ─────────────────────────────────────
function createDeviceIcon(isOnline: boolean, isSelected: boolean) {
    const color = isOnline ? '#22c55e' : '#ef4444';
    const size = isSelected ? 20 : 14;
    const outerSize = isSelected ? 32 : 22;
    const borderColor = isSelected ? '#C5A059' : color;
    const borderWidth = isSelected ? 3 : 2;

    return L.divIcon({
        className: 'custom-device-marker',
        html: `
            <div style="
                width: ${outerSize}px; 
                height: ${outerSize}px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    width: ${outerSize}px;
                    height: ${outerSize}px;
                    border-radius: 50%;
                    background: ${color}20;
                    ${isOnline ? 'animation: marker-pulse 2s ease-in-out infinite;' : ''}
                "></div>
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border: ${borderWidth}px solid ${borderColor};
                    border-radius: 50%;
                    box-shadow: 0 2px 8px ${color}40;
                    position: relative;
                    z-index: 1;
                "></div>
            </div>
        `,
        iconSize: [outerSize, outerSize],
        iconAnchor: [outerSize / 2, outerSize / 2],
    });
}

// ─── Component to fly to selected device ─────────────────────
function FlyToDevice({ locations, selectedDeviceId }: { locations: LocationData[]; selectedDeviceId: string | null }) {
    const map = useMap();

    useEffect(() => {
        if (selectedDeviceId) {
            const loc = locations.find(l => l.device.id === selectedDeviceId);
            if (loc?.location) {
                map.flyTo([loc.location.lat, loc.location.lng], 16, { duration: 1 });
            }
        }
    }, [selectedDeviceId, locations, map]);

    return null;
}

// ─── Auto fit bounds ─────────────────────────────────────────
function FitBounds({ locations }: { locations: LocationData[] }) {
    const map = useMap();
    const hasInit = useRef(false);

    useEffect(() => {
        if (hasInit.current) return;
        const validLocs = locations.filter(l => l.location);
        if (validLocs.length === 0) return;

        hasInit.current = true;

        if (validLocs.length === 1) {
            const loc = validLocs[0].location!;
            map.setView([loc.lat, loc.lng], 15);
        } else {
            const bounds = L.latLngBounds(
                validLocs.map(l => [l.location!.lat, l.location!.lng])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    return null;
}

export default function MapView({ locations, selectedDeviceId, onSelectDevice }: MapViewProps) {
    // Default center: Bangkok
    const defaultCenter: [number, number] = [13.7563, 100.5018];

    const validLocations = locations.filter(l => l.location);

    const center: [number, number] = validLocations.length > 0
        ? [validLocations[0].location!.lat, validLocations[0].location!.lng]
        : defaultCenter;

    return (
        <>
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds locations={locations} />
                <FlyToDevice locations={locations} selectedDeviceId={selectedDeviceId} />

                {validLocations.map((loc) => {
                    const { device, location } = loc;
                    const isSelected = device.id === selectedDeviceId;

                    return (
                        <Marker
                            key={device.id}
                            position={[location!.lat, location!.lng]}
                            icon={createDeviceIcon(device.isOnline, isSelected)}
                            eventHandlers={{
                                click: () => onSelectDevice(isSelected ? null : device.id),
                            }}
                        >
                            <Popup>
                                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: device.isOnline ? '#22c55e' : '#ef4444',
                                        }} />
                                        <strong style={{ fontSize: 14 }}>{device.name}</strong>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                                        <div>🔋 Battery: {device.battery}%</div>
                                        {location!.speed != null && <div>🚗 Speed: {location!.speed.toFixed(1)} km/h</div>}
                                        <div>📍 {location!.lat.toFixed(5)}, {location!.lng.toFixed(5)}</div>
                                        <div>🕐 {new Date(location!.timestamp).toLocaleString('th-TH')}</div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <style jsx global>{`
                .custom-device-marker {
                    background: transparent !important;
                    border: none !important;
                }
                @keyframes marker-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.5); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                }
                .leaflet-popup-tip {
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </>
    );
}
