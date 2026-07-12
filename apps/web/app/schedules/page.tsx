'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Ward { id: string; name: string; code: string; color: string; }
interface ShiftType { id: string; name: string; code: string; color: string; }
interface Nurse { id: string; employeeId: string; firstName: string; lastName: string; wardId: string; }
interface ScheduleEntry { date: string; type: string; shift: ShiftType; }
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

export default function SchedulesPage() {
    const [wards, setWards] = useState<Ward[]>([]);
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [selectedWard, setSelectedWard] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
    const [selectedNurseId, setSelectedNurseId] = useState<string>('');

    useEffect(() => {
        if (schedule?.nurses.length && !selectedNurseId) {
            setSelectedNurseId(schedule.nurses[0].nurseId);
        }
    }, [schedule, selectedNurseId]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedWard) {
            fetchSchedule();
        }
    }, [selectedWard, currentDate]);

    const fetchInitialData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const [wardsRes, shiftRes] = await Promise.all([
                fetch(`${apiUrl}/nurse/wards`, { credentials: 'include' }),
                fetch(`${apiUrl}/nurse/shift-types`, { credentials: 'include' })
            ]);

            if (wardsRes.ok) {
                const data = await wardsRes.json();
                setWards(data);
                if (data.length > 0 && !selectedWard) setSelectedWard(data[0].id);
            }
            if (shiftRes.ok) setShiftTypes(await shiftRes.json());
        } catch (err) {
            console.error('Failed to fetch initial data', err);
        }
    };

    const fetchSchedule = async () => {
        if (!selectedWard) return;
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/nurse/schedules?wardId=${selectedWard}&year=${year}&month=${month}`, {
                credentials: 'include'
            });

            if (!res.ok) {
                setSchedule(null);
            } else {
                setSchedule(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
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

    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1c1917] font-sans selection:bg-[#C5A059]/20 transition-colors duration-500">
            
            <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-stone-800 dark:text-stone-100 uppercase">
                            ตารางเวรพยาบาล
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">ดูตารางการทำงานของแผนกประจำเดือน</p>
                    </div>
                    
                    <div className="flex bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 w-full md:w-auto">
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-stone-700 shadow-md text-[#C5A059]' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            ปฏิทินส่วนตัว
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-stone-700 shadow-md text-[#C5A059]' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            ตารางรวม
                        </button>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-xl shadow-stone-200/50 dark:shadow-none border border-white/50 dark:border-stone-800 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            className="w-full sm:w-auto rounded-2xl px-5 py-3 outline-none text-sm font-bold bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 cursor-pointer"
                        >
                            {wards.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 rounded-2xl p-1.5 border border-stone-200 dark:border-stone-700">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-300"><ChevronLeft size={18} /></button>
                            <span className="text-sm font-black min-w-[120px] text-center text-stone-800 dark:text-stone-100 uppercase tracking-widest">
                                {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-300"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-stone-500 dark:text-stone-400">
                        {shiftTypes.map(s => (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: translateShiftColor(s.code, s.color) }}></div>
                                <span>{translateShiftCode(s.code)}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] text-rose-500">✗</div>
                            <span>OFF</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 size={40} className="animate-spin text-[#C5A059] mb-4" />
                            <p className="text-stone-500 dark:text-stone-400 font-medium tracking-widest text-sm">กำลังโหลดข้อมูลตารางเวร...</p>
                        </div>
                    ) : !schedule ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 text-stone-300 dark:text-stone-600">
                                <CalendarIcon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">ไม่พบตารางเวร</h3>
                            <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto">ยังไม่มีการจัดตารางเวรสำหรับแผนกและเดือนที่คุณเลือก</p>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-xs md:text-sm">
                                <thead>
                                    <tr className="bg-[#FAFAF9] dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="sticky left-0 z-20 py-4 px-6 text-left min-w-[250px] bg-[#FAFAF9] dark:bg-stone-800/80 shadow-[1px_0_0_0_#e7e5e4] dark:shadow-[1px_0_0_0_#292524]">
                                            ข้อมูลบุคลากร
                                        </th>
                                        {daysArray.map(day => (
                                            <th key={day} className="py-4 px-2 text-center min-w-[48px] border-l border-stone-200/50 dark:border-stone-700/50">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                                                        {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </span>
                                                    <span className="text-sm text-stone-700 dark:text-stone-300">
                                                        {day}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="py-4 px-4 text-center min-w-[200px] border-l border-stone-200/50 dark:border-stone-700/50">
                                            สรุปยอด (วัน)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.nurses.map((nurse, i) => (
                                        <tr key={nurse.nurseId} className="group hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors border-b border-stone-100 dark:border-stone-800 last:border-b-0">
                                            <td className="sticky left-0 z-10 py-3 px-6 font-bold bg-white dark:bg-stone-900 group-hover:bg-stone-50 dark:group-hover:bg-stone-800/30 transition-colors shadow-[1px_0_0_0_#f5f5f4] dark:shadow-[1px_0_0_0_#292524] text-stone-800 dark:text-stone-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8c7340] text-white flex items-center justify-center text-xs shadow-md shadow-[#C5A059]/20">
                                                        {nurse.fullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{nurse.fullName}</span>
                                                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">ID: {nurse.employeeId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {daysArray.map(day => {
                                                const shift = nurse.shifts.find(s => new Date(s.date).getDate() === day);
                                                let bgColor = 'transparent';
                                                let textColor = 'inherit';

                                                if (shift) {
                                                    if (shift.type === 'OFF') {
                                                        bgColor = '#f43f5e15';
                                                        textColor = '#f43f5e';
                                                    } else if (shift.type === 'LEAVE') {
                                                        bgColor = '#f43f5e15';
                                                        textColor = '#f43f5e';
                                                    } else if (shift.shift) {
                                                        const color = translateShiftColor(shift.shift.code, shift.shift.color);
                                                        bgColor = `${color}15`;
                                                        textColor = color;
                                                    }
                                                }

                                                return (
                                                    <td key={day} className="py-2 px-1 text-center border-l border-stone-100 dark:border-stone-800/50">
                                                        <div
                                                            className={`h-10 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all ${!shift ? 'bg-stone-50 dark:bg-stone-800/50 text-stone-300 dark:text-stone-600' : ''}`}
                                                            style={shift ? { backgroundColor: bgColor, color: textColor } : {}}
                                                        >
                                                            {shift ? (shift.type === 'OFF' ? <span className="text-lg text-[#f43f5e] font-normal">✗</span> : (shift.type === 'LEAVE' ? 'ลา' : translateShiftCode(shift.shift?.code))) : '-'}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="py-2 px-4 border-l border-stone-100 dark:border-stone-800/50">
                                                <div className="flex items-center justify-between gap-2 text-xs font-bold bg-stone-50 dark:bg-stone-800/50 rounded-xl px-3 py-2">
                                                    <div className="flex flex-col items-center text-stone-600 dark:text-stone-300">
                                                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-0.5">เวร</span>
                                                        <span>{nurse.summary.totalShifts}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700"></div>
                                                    <div className="flex flex-col items-center text-stone-600 dark:text-stone-300">
                                                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-0.5">หยุด</span>
                                                        <span>{nurse.summary.totalOff}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700"></div>
                                                    <div className="flex flex-col items-center text-rose-500">
                                                        <span className="text-[10px] font-medium text-rose-400/70 uppercase tracking-widest mb-0.5">ลา</span>
                                                        <span>{nurse.summary.totalLeave}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        (() => {
                            const nurse = schedule.nurses.find(n => n.nurseId === selectedNurseId) || schedule.nurses[0];
                            if (!nurse) return null;

                            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
                            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                            
                            const calendarCells = Array.from({ length: 42 }, (_, i) => {
                                const day = i - firstDayOfMonth + 1;
                                if (day > 0 && day <= daysInMonth) return day;
                                return null;
                            });

                            const weekDaysThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

                            return (
                                <div className="p-4 md:p-6 border-t border-stone-100 dark:border-stone-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8c7340] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#C5A059]/20">
                                                {nurse.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">{nurse.fullName}</h2>
                                                <p className="text-sm text-stone-500 dark:text-stone-400">ID: {nurse.employeeId}</p>
                                            </div>
                                        </div>
                                        
                                        {schedule.nurses.length > 1 && (
                                            <select
                                                value={selectedNurseId}
                                                onChange={(e) => setSelectedNurseId(e.target.value)}
                                                className="rounded-xl px-5 py-3 outline-none text-sm font-bold bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 w-full sm:w-auto cursor-pointer"
                                            >
                                                {schedule.nurses.map(n => <option key={n.nurseId} value={n.nurseId}>{n.fullName}</option>)}
                                            </select>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-7 gap-px bg-stone-200 dark:bg-stone-800 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner">
                                        {weekDaysThai.map((wd, i) => (
                                            <div key={wd} className={`bg-stone-50 dark:bg-stone-900 py-3 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider ${i === 0 || i === 6 ? 'text-rose-500' : 'text-stone-500 dark:text-stone-400'}`}>
                                                <span className="hidden md:inline">{wd}</span>
                                                <span className="md:hidden">{wd.replace('พฤหัสบดี', 'พฤหัส')}</span>
                                            </div>
                                        ))}
                                        
                                        {calendarCells.map((day, i) => {
                                            if (!day) return <div key={i} className="bg-stone-50/50 dark:bg-stone-900/50 min-h-[80px] md:min-h-[120px]"></div>;
                                            
                                            const shift = nurse.shifts.find(s => new Date(s.date).getDate() === day);
                                            const isWeekend = i % 7 === 0 || i % 7 === 6;
                                            
                                            let content = null;
                                            if (shift) {
                                                if (shift.type === 'OFF') {
                                                    content = <span className="text-4xl md:text-5xl font-light text-rose-500/80 select-none">✗</span>;
                                                } else if (shift.type === 'LEAVE') {
                                                    content = <span className="text-2xl font-bold text-rose-500 select-none">ลา</span>;
                                                } else if (shift.shift) {
                                                    const color = translateShiftColor(shift.shift.code, shift.shift.color);
                                                    content = <span className="text-3xl md:text-4xl font-black select-none" style={{ color }}>{translateShiftCode(shift.shift.code)}</span>;
                                                }
                                            }

                                            return (
                                                <div key={i} className="bg-white dark:bg-stone-900 min-h-[80px] md:min-h-[120px] p-2 flex flex-col relative group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                                    <span className={`text-xs md:text-sm font-bold ${isWeekend ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'}`}>{day}</span>
                                                    <div className="flex-1 flex items-center justify-center">
                                                        {content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 py-4 px-6 rounded-2xl border border-stone-200 dark:border-stone-800">
                                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-stone-400"></div> เวร: <b className="text-stone-800 dark:text-stone-100">{nurse.summary.totalShifts}</b></span>
                                        <span className="w-px h-4 bg-stone-300 dark:bg-stone-600"></span>
                                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-stone-300"></div> หยุด: <b className="text-stone-800 dark:text-stone-100">{nurse.summary.totalOff}</b></span>
                                        <span className="w-px h-4 bg-stone-300 dark:bg-stone-600"></span>
                                        <span className="flex items-center gap-2 text-rose-500"><div className="w-2 h-2 rounded-full bg-rose-500"></div> ลา: <b className="text-rose-600 dark:text-rose-400">{nurse.summary.totalLeave}</b></span>
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </div>
            </main>
        </div>
    );
}
