'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Delete, Fingerprint, Loader2 } from 'lucide-react';

interface PinLockProps {
    onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // เลี่ยงปัญหา Hydration mismatch ในรันบนฝั่ง Client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // ดึงค่า PIN จาก .env หรือใช้ Default
    const CORRECT_PIN = process.env.NEXT_PUBLIC_MEMORIES_PIN || '501010';

    const handleInput = (num: string) => {
        if (pin.length < 6) {
            setError(false);
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    useEffect(() => {
        if (pin.length === 6) {
            setLoading(true);
            setTimeout(() => {
                if (pin === CORRECT_PIN) {
                    onUnlock();
                } else {
                    setError(true);
                    setPin('');
                    setLoading(false);
                }
            }, 700); // จำลองจังหวะโหลดเช็ครหัสเพื่อความหรูหรา
        }
    }, [pin, CORRECT_PIN, onUnlock]);

    if (!isClient) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#141312] font-sans flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-[#C5A059]/20">

            {/* Ambient backgrounds */}
            <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 animate-pulse-slow"></div>
            <div className="absolute bottom-10 -left-20 w-[300px] h-[300px] bg-stone-700/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className={`w-full max-w-sm flex flex-col items-center relative z-10 transition-all duration-300 ${error ? 'translate-x-[-10px]' : ''}`}>

                {/* Header Icon */}
                <div className={`w-16 h-16 rounded-full bg-stone-800/80 border border-stone-700/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.05)] backdrop-blur-md transition-all duration-300 ${error ? 'border-red-500/50 shadow-red-500/20' : ''}`}>
                    {error ? (
                        <Lock className="text-red-500 w-7 h-7 animate-pulse" />
                    ) : (
                        <Fingerprint className={`text-[#C5A059] w-8 h-8 ${loading ? 'animate-pulse scale-110' : ''}`} />
                    )}
                </div>

                <h2 className="text-stone-200 text-lg md:text-xl font-bold tracking-[0.3em] mb-2 uppercase">
                    {error ? <span className="text-red-400">Access Denied</span> : 'Locked Vault'}
                </h2>
                <p className="text-stone-500 text-xs tracking-widest uppercase mb-12">
                    {error ? 'Incorrect Passcode' : 'Enter Passcode'}
                </p>

                {/* Dots Display */}
                <div className="flex items-center gap-4 mb-14">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i < pin.length
                                    ? error
                                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                        : 'bg-[#C5A059] scale-110 shadow-[0_0_15px_rgba(197,160,89,0.4)]'
                                    : 'bg-stone-800/80 border border-stone-700/50 scale-100'
                                }`}
                        ></div>
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleInput(num.toString())}
                            disabled={pin.length >= 6 || loading}
                            className="w-[72px] h-[72px] mx-auto rounded-full bg-stone-900/40 backdrop-blur-md border border-stone-800 flex items-center justify-center text-2xl font-light text-stone-300 hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}

                    <div className="w-[72px] h-[72px] mx-auto flex items-center justify-center">
                        {/* Empty space */}
                    </div>

                    <button
                        onClick={() => handleInput('0')}
                        disabled={pin.length >= 6 || loading}
                        className="w-[72px] h-[72px] mx-auto rounded-full bg-stone-900/40 backdrop-blur-md border border-stone-800 flex items-center justify-center text-2xl font-light text-stone-300 hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50"
                    >
                        0
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={pin.length === 0 || loading}
                        className="w-[72px] h-[72px] mx-auto flex items-center justify-center text-stone-600 hover:text-stone-300 transition-colors duration-300 active:scale-95 disabled:opacity-20"
                    >
                        <Delete className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    );
}
