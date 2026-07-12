'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Calendar as CalendarIcon,
    Upload,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    Download,
    Edit,
    Save
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Ward {
    id: string;
    name: string;
    code: string;
    color: string;
}

interface ShiftType {
    id: string;
    name: string;
    code: string;
    color: string;
}

interface Nurse {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    wardId: string;
}

interface ScheduleEntry {
    date: string;
    type: string;
    shift: ShiftType;
}

interface ScheduleNurse {
    nurseId: string;
    employeeId: string;
    fullName: string;
    shifts: ScheduleEntry[];
    summary: { totalShifts: number; totalOff: number; totalLeave: number };
}

interface ScheduleData {
    scheduleId: string;
    ward: Ward;
    year: number;
    month: number;
    isPublished: boolean;
    nurses: ScheduleNurse[];
}

export default function NurseSchedulesPage() {
    const [wards, setWards] = useState<Ward[]>([]);
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]);

    const [selectedWard, setSelectedWard] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalSchedule, setOriginalSchedule] = useState<ScheduleData | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedWard) {
            setIsEditing(false);
            fetchSchedule();
        }
    }, [selectedWard, currentDate]);

    const fetchInitialData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

            const [wardsRes, shiftRes, nurseRes] = await Promise.all([
                fetch(`${apiUrl}/nurse/wards`, { credentials: 'include' }),
                fetch(`${apiUrl}/nurse/shift-types`, { credentials: 'include' }),
                fetch(`${apiUrl}/nurse/nurses`, { credentials: 'include' })
            ]);

            if (wardsRes.ok) {
                const data = await wardsRes.json();
                setWards(data);
                if (data.length > 0 && !selectedWard) {
                    setSelectedWard(data[0].id);
                }
            }
            if (shiftRes.ok) setShiftTypes(await shiftRes.json());
            if (nurseRes.ok) setNurses(await nurseRes.json());

        } catch (err) {
            console.error('Failed to fetch initial data', err);
        }
    };

    const fetchSchedule = async () => {
        if (!selectedWard) return;
        setLoading(true);
        setError(null);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/nurse/schedules?wardId=${selectedWard}&year=${year}&month=${month}`, {
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setSchedule(null);
                } else {
                    throw new Error('Failed to fetch schedule');
                }
            } else {
                const data = await res.json();
                setSchedule(data);
                setOriginalSchedule(JSON.parse(JSON.stringify(data))); // Deep copy
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShiftChange = (nurseId: string, day: number, newCode: string) => {
        if (!schedule) return;
        const newSchedule = { ...schedule };
        const nurseIndex = newSchedule.nurses.findIndex(n => n.nurseId === nurseId);
        if (nurseIndex === -1) return;

        const dateStr = `${schedule.year}-${String(schedule.month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;

        let shifts = [...newSchedule.nurses[nurseIndex].shifts];
        const existingShiftIndex = shifts.findIndex(s => new Date(s.date).toISOString() === dateStr || new Date(s.date).getDate() === day);

        if (newCode === '') {
            // Remove shift
            if (existingShiftIndex !== -1) shifts.splice(existingShiftIndex, 1);
        } else {
            let type = 'SHIFT';
            let shiftObj = undefined;

            if (newCode === 'O') type = 'OFF';
            else if (newCode === 'L') type = 'LEAVE';
            else {
                shiftObj = shiftTypes.find(s => s.code === newCode);
            }

            const newEntry = {
                date: dateStr,
                type,
                shift: shiftObj as ShiftType
            };

            if (existingShiftIndex !== -1) {
                shifts[existingShiftIndex] = newEntry;
            } else {
                shifts.push(newEntry);
            }
        }

        // Recalculate summary
        let totalShifts = 0, totalOff = 0, totalLeave = 0;
        shifts.forEach(s => {
            if (s.type === 'SHIFT') totalShifts++;
            if (s.type === 'OFF') totalOff++;
            if (s.type === 'LEAVE') totalLeave++;
        });

        newSchedule.nurses[nurseIndex] = {
            ...newSchedule.nurses[nurseIndex],
            shifts,
            summary: { totalShifts, totalOff, totalLeave }
        };

        setSchedule(newSchedule);
    };

    const handleSaveChanges = async () => {
        if (!schedule || !selectedWard) return;
        setLoading(true);
        try {
            const entries: any[] = [];
            schedule.nurses.forEach(nurse => {
                nurse.shifts.forEach(shift => {
                    entries.push({
                        nurseId: nurse.nurseId,
                        date: shift.date,
                        type: shift.type,
                        shiftTypeId: shift.shift?.id
                    });
                });
            });

            const payload = {
                wardId: selectedWard,
                year: schedule.year,
                month: schedule.month,
                entries
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/nurse/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save changes');

            setIsEditing(false);
            await fetchSchedule();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const cancelEditing = () => {
        setSchedule(originalSchedule ? JSON.parse(JSON.stringify(originalSchedule)) : null);
        setIsEditing(false);
    };

    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const translateShiftCode = (code: string | undefined) => {
        if (!code) return '';
        switch (code.toUpperCase()) {
            case 'M': return 'ช';
            case 'A': return 'บ';
            case 'N': return 'ด';
            case 'M/A': return 'ช/บ';
            case 'N/A': return 'ด/บ';
            case 'OFF': return 'หยุด';
            default: return code;
        }
    };

    const translateShiftColor = (code: string | undefined, originalColor: string) => {
        if (!code) return originalColor;
        switch (code.toUpperCase()) {
            case 'A': return '#10b981'; // เปลี่ยนสี 'บ' (A) ให้เป็นสีเขียวมรกต เพื่อให้ต่างจาก 'ด' (N) อย่างชัดเจน
            default: return originalColor;
        }
    };

    const getShiftColor = (shiftCode: string) => {
        const type = shiftTypes.find(s => s.code === shiftCode);
        return type ? translateShiftColor(type.code, type.color) : '#cbd5e1';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Nurse Schedules</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการตารางเวรพยาบาลรายเดือน</p>
                </div>
                <div className="flex items-center gap-3">
                    {schedule && (
                        isEditing ? (
                            <>
                                <button
                                    onClick={cancelEditing}
                                    className="px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                                    style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                                style={{ color: 'var(--admin-fg)', backgroundColor: 'var(--admin-hover)' }}
                            >
                                <Edit size={16} /> Edit
                            </button>
                        )
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
                    >
                        <Upload size={16} /> Import Excel
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="rounded-xl px-4 py-2 outline-none text-sm font-semibold min-w-[200px]"
                        style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)', border: '1px solid var(--admin-border)' }}
                    >
                        {wards.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 bg-[var(--admin-hover)] rounded-xl p-1 border border-[var(--admin-border)]">
                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--admin-border)] transition-colors text-[var(--admin-fg)]"><ChevronLeft size={16} /></button>
                        <span className="text-sm font-bold min-w-[100px] text-center" style={{ color: 'var(--admin-fg)' }}>
                            {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--admin-border)] transition-colors text-[var(--admin-fg)]"><ChevronRight size={16} /></button>
                    </div>
                </div>

                <div className="flex gap-3 text-xs font-semibold">
                    {shiftTypes.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: translateShiftColor(s.code, s.color) }}></div>
                            <span style={{ color: 'var(--admin-muted)' }}>{translateShiftCode(s.code)}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[8px]" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>✗</div>
                        <span style={{ color: 'var(--admin-muted)' }}>OFF</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
                        <p style={{ color: 'var(--admin-muted)' }}>กำลังโหลดตารางเวร...</p>
                    </div>
                ) : !schedule ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <CalendarIcon size={48} className="mb-4 opacity-20" style={{ color: 'var(--admin-fg)' }} />
                        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--admin-fg)' }}>ยังไม่มีตารางเวรในเดือนนี้</h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--admin-muted)' }}>คลิกที่ปุ่ม Import Excel เพื่ออัปโหลดตารางเวรเข้าสู่ระบบ</p>
                        <button onClick={() => setShowUploadModal(true)} className="px-5 py-2 rounded-xl font-semibold text-sm text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 transition-all">
                            นำเข้าตารางเวร
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 py-3 px-4 text-left font-bold border-b min-w-[200px]" style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)', color: 'var(--admin-fg-secondary)' }}>
                                        พยาบาล / ผู้ช่วย
                                    </th>
                                    {daysArray.map(day => (
                                        <th key={day} className="py-2 px-1 text-center font-bold border-b min-w-[32px]" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                                            {day}
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-center font-bold border-b border-l" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>รวมเวร</th>
                                    <th className="py-3 px-4 text-center font-bold border-b" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>OFF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.nurses.map((nurse, idx) => (
                                    <tr key={nurse.nurseId} className="hover:bg-[var(--admin-hover)] transition-colors border-b last:border-b-0" style={{ borderColor: 'var(--admin-border)' }}>
                                        <td className="sticky left-0 z-10 py-2.5 px-4 font-semibold shadow-[1px_0_0_0_var(--admin-border)]" style={{ backgroundColor: 'inherit', color: 'var(--admin-fg)' }}>
                                            <div className="flex flex-col">
                                                <span className="truncate">{nurse.fullName}</span>
                                                <span className="text-[10px] opacity-60 font-medium">{nurse.employeeId}</span>
                                            </div>
                                        </td>
                                        {daysArray.map(day => {
                                            const dateStr = `${schedule.year}-${String(schedule.month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
                                            const shift = nurse.shifts.find(s => new Date(s.date).toISOString() === dateStr || new Date(s.date).getDate() === day);

                                            let content = '-';
                                            let bgColor = 'transparent';
                                            let textColor = 'var(--admin-muted)';
                                            let currentVal = '';

                                            if (shift) {
                                                if (shift.type === 'SHIFT' && shift.shift) {
                                                    content = translateShiftCode(shift.shift.code);
                                                    currentVal = shift.shift.code;
                                                    const color = translateShiftColor(shift.shift.code, shift.shift.color);
                                                    bgColor = `${color}20`; // 20% opacity
                                                    textColor = color;
                                                } else if (shift.type === 'OFF') {
                                                    content = '✗';
                                                    currentVal = 'O';
                                                    bgColor = '#ef444420'; // Red 20% opacity
                                                    textColor = '#ef4444'; // Red text
                                                } else if (shift.type === 'LEAVE') {
                                                    content = 'ลา';
                                                    currentVal = 'L';
                                                    bgColor = '#f43f5e20';
                                                    textColor = '#f43f5e';
                                                }
                                            }

                                            return (
                                                <td key={day} className="py-1 px-1 text-center border-r last:border-r-0 border-[var(--admin-border)]">
                                                    {isEditing ? (
                                                        <select
                                                            value={currentVal}
                                                            onChange={(e) => handleShiftChange(nurse.nurseId, day, e.target.value)}
                                                            className="w-full h-8 mx-auto rounded font-bold text-[11px] outline-none text-center appearance-none cursor-pointer"
                                                            style={{ backgroundColor: bgColor, color: textColor, border: '1px solid var(--admin-border)' }}
                                                        >
                                                            <option value="">-</option>
                                                            {shiftTypes.map(s => <option key={s.id} value={s.code}>{translateShiftCode(s.code)}</option>)}
                                                            <option value="O">หยุด</option>
                                                            <option value="L">ลา</option>
                                                        </select>
                                                    ) : (
                                                        <div className="w-7 h-7 mx-auto rounded flex items-center justify-center font-bold text-[11px]" style={{ backgroundColor: bgColor, color: textColor }}>
                                                            {content}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="py-2.5 px-4 text-center font-bold border-l" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-fg)' }}>
                                            {nurse.summary.totalShifts}
                                        </td>
                                        <td className="py-2.5 px-4 text-center font-bold" style={{ color: 'var(--admin-fg)' }}>
                                            {nurse.summary.totalOff}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    wards={wards}
                    shiftTypes={shiftTypes}
                    nurses={nurses}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchSchedule();
                    }}
                />
            )}
        </div>
    );
}

// --- Upload Modal Component ---
function UploadModal({ wards, shiftTypes, nurses, onClose, onSuccess }: { wards: Ward[], shiftTypes: ShiftType[], nurses: Nurse[], onClose: () => void, onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [selectedWard, setSelectedWard] = useState<string>(wards[0]?.id || '');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [note, setNote] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ entries: any[]; mappedCount: number; unmappedCount: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        setError(null);
        setPreview(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert to array of arrays
                const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (rows.length < 2) {
                    throw new Error('ไม่พบข้อมูลในไฟล์ Excel');
                }

                // First row is header. Find the employee Id column. Assume column index 0 is Employee ID or Name, index 1..31 are days
                // Let's create a generic mapper.
                const entries: any[] = [];
                let mappedCount = 0;
                let unmappedCount = 0;

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;

                    const empIdRaw = String(row[0] || '').trim();
                    if (!empIdRaw) continue;

                    // Find nurse by Employee ID or Name
                    const nurse = nurses.find(n => n.employeeId === empIdRaw || n.firstName.includes(empIdRaw) || n.lastName.includes(empIdRaw));

                    if (nurse) {
                        mappedCount++;
                        // Assume column 1 to 31 are days
                        for (let day = 1; day <= 31; day++) {
                            const shiftCode = String(row[day] || '').trim().toUpperCase();
                            if (!shiftCode) continue;

                            let type = 'SHIFT';
                            let shiftTypeId = undefined;

                            if (shiftCode === 'O' || shiftCode === 'OFF' || shiftCode === 'X' || shiftCode === 'หยุด') {
                                type = 'OFF';
                            } else if (shiftCode === 'L' || shiftCode === 'LEAVE' || shiftCode === 'ลา') {
                                type = 'LEAVE';
                            } else {
                                // Reverse translate Thai shift codes back to DB codes
                                let searchCode = shiftCode;
                                if (shiftCode === 'ช') searchCode = 'M';
                                else if (shiftCode === 'บ') searchCode = 'A';
                                else if (shiftCode === 'ด') searchCode = 'N';
                                else if (shiftCode === 'ช/บ') searchCode = 'M/A';
                                else if (shiftCode === 'ด/บ') searchCode = 'N/A';

                                const foundShift = shiftTypes.find(s => s.code.toUpperCase() === searchCode || s.code.toUpperCase() === shiftCode);
                                if (foundShift) {
                                    shiftTypeId = foundShift.id;
                                } else {
                                    // Unknown shift, ignore or set to OFF
                                    continue;
                                }
                            }

                            // Formulate date string
                            const dateObj = new Date(Date.UTC(year, month - 1, day));
                            // Only add if date is valid for that month
                            if (dateObj.getMonth() === month - 1) {
                                entries.push({
                                    nurseId: nurse.id,
                                    date: dateObj.toISOString(),
                                    type,
                                    shiftTypeId
                                });
                            }
                        }
                    } else {
                        unmappedCount++;
                    }
                }

                setPreview({ entries, mappedCount, unmappedCount });

            } catch (err: any) {
                setError('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        if (!preview || !selectedWard) return;

        try {
            setLoading(true);
            setError(null);

            const payload = {
                wardId: selectedWard,
                year,
                month,
                note,
                entries: preview.entries
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/nurse/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save schedule');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !loading && onClose()} />
            <div className="relative rounded-2xl w-full max-w-lg shadow-2xl animate-modal-enter overflow-hidden flex flex-col max-h-[90vh]" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--admin-border)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
                            <FileSpreadsheet size={16} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>Import Schedule</h2>
                    </div>
                    <button
                        onClick={onClose} disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--admin-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-5">
                    {error && (
                        <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-sm font-semibold">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Ward</label>
                            <select
                                value={selectedWard} onChange={e => setSelectedWard(e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                            >
                                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Month</label>
                                <select
                                    value={month} onChange={e => setMonth(Number(e.target.value))}
                                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>Year</label>
                                <input
                                    type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                    style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {!file ? (
                        <div
                            className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[var(--admin-hover)]"
                            style={{ borderColor: 'var(--admin-border)' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" accept=".xlsx, .csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <Upload size={32} style={{ color: 'var(--admin-muted)' }} className="mb-3" />
                            <p className="text-sm font-bold mb-1" style={{ color: 'var(--admin-fg)' }}>อัปโหลดไฟล์ Excel / CSV</p>
                            <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>คลิกเพื่อเลือกไฟล์ (คอลัมน์แรก = รหัสพนักงาน, คอลัมน์ต่อไป = วันที่ 1-31)</p>

                            <a href="/template_schedule.csv" target="_blank" className="flex items-center gap-1 mt-4 text-xs font-bold text-[#C5A059] hover:underline" onClick={e => e.stopPropagation()}>
                                <Download size={14} /> ดาวน์โหลดไฟล์ตัวอย่าง CSV
                            </a>
                        </div>
                    ) : (
                        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileSpreadsheet size={24} className="text-[#C5A059] flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: 'var(--admin-fg)' }}>{file.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => { setFile(null); setPreview(null); }} className="text-xs font-bold text-red-400 hover:underline">เปลี่ยนไฟล์</button>
                            </div>

                            {preview && (
                                <div className="bg-[var(--admin-card)] rounded-lg p-3 text-xs flex gap-4 border border-[var(--admin-border)]">
                                    <div className="flex-1">
                                        <p style={{ color: 'var(--admin-muted)' }}>พยาบาลที่พบในระบบ</p>
                                        <p className="text-lg font-bold text-emerald-500">{preview.mappedCount} คน</p>
                                    </div>
                                    <div className="flex-1">
                                        <p style={{ color: 'var(--admin-muted)' }}>ไม่พบในระบบ (ข้าม)</p>
                                        <p className={`text-lg font-bold ${preview.unmappedCount > 0 ? 'text-amber-500' : 'text-[var(--admin-fg)]'}`}>{preview.unmappedCount} คน</p>
                                    </div>
                                    <div className="flex-1">
                                        <p style={{ color: 'var(--admin-muted)' }}>จำนวนเวรทั้งหมด</p>
                                        <p className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>{preview.entries.length} กะ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 flex justify-end gap-3 flex-shrink-0" style={{ borderTop: '1px solid var(--admin-border)' }}>
                    <button
                        onClick={onClose} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                        style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)' }}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleUpload} disabled={loading || !preview || preview.entries.length === 0}
                        className="px-5 py-2 text-sm font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        บันทึกตารางเวร
                    </button>
                </div>

            </div>
        </div>
    );
}
