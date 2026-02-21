"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Lock, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pageInitializing, setPageInitializing] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Initial check for automatically logging in if tokens exist
    React.useEffect(() => {
        const checkAutoLogin = async () => {
            let token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!token && !refreshToken) {
                setPageInitializing(false);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            try {
                // Try fetching profile with current access token
                let res = await fetch(`${apiUrl}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // If unauthorized and we have a refresh token, try refreshing
                if (res.status === 401 && refreshToken) {
                    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        token = refreshData.accessToken;
                        localStorage.setItem('token', token!);
                        if (refreshData.refreshToken) {
                            localStorage.setItem('refreshToken', refreshData.refreshToken);
                        }
                        // Retry fetching profile
                        res = await fetch(`${apiUrl}/auth/profile`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } else {
                        throw new Error('Refresh failed');
                    }
                }

                if (res.ok) {
                    const data = await res.json();
                    if (data.role === 'ADMIN') {
                        router.push('/admin/dashboard');
                    } else {
                        router.push('/');
                    }
                    // Don't setPageInitializing to false here as we're redirecting
                    return;
                } else {
                    throw new Error('Profile fetch failed');
                }
            } catch (err) {
                console.error('Auto login failed:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setPageInitializing(false);
            }
        };

        checkAutoLogin();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // If the error message is an array (from class-validator), join it
                const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
                throw new Error(errorMsg || 'ล็อกอินล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }

            // Save tokens to localStorage
            localStorage.setItem('token', data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Check role and redirect
            if (data.user?.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        } finally {
            setLoading(false);
        }
    };

    if (pageInitializing) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-stone-50">
                <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative overflow-hidden bg-white flex font-sans selection:bg-[#C5A059]/20 selection:text-[#8A6E3E]">

            {/* --- LEFT PANEL: Branding & Animation (Hidden on mobile) --- */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#1A1817] shadow-2xl">

                {/* Ambient lights */}
                <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#C5A059]/15 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 animate-pulse-slow"></div>
                <div className="absolute bottom-0 -left-10 w-[400px] h-[400px] bg-stone-700/30 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Top header */}
                <div className="relative z-10 flex items-center gap-3 w-fit hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-[#C5A059]/20 flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="text-[#C5A059] w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest uppercase">Family JS</span>
                </div>

                {/* Center: Animated Logo Layer */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center group perspective-1000">
                        {/* Outer rings spinning */}
                        <div className="absolute inset-0 border-2 border-[#C5A059]/20 border-dashed rounded-full animate-[spin_15s_linear_infinite]"></div>
                        <div className="absolute inset-[-20px] border border-stone-500/20 rounded-full animate-[spin_25s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-[spin_35s_linear_infinite]"></div>
                        <div className="absolute inset-[-60px] border border-[#C5A059]/5 border-dotted rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

                        {/* Floating & Tilting Logo */}
                        <div className="relative w-[85%] h-[85%] rounded-full overflow-hidden bg-stone-900 border-4 border-stone-800 shadow-[0_0_50px_rgba(197,160,89,0.15)] transition-all duration-700 transform-gpu group-hover:scale-[1.03] group-hover:rotate-6 animate-float">
                            <Image
                                src="/images/logo1.png"
                                alt="Family JS Logo"
                                fill
                                className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100 scale-110"
                            />
                            {/* Glass overlay reflection */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="relative z-10 space-y-4 max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="w-10 h-1 bg-[#C5A059] rounded-full"></div>
                    <p className="text-xl sm:text-2xl font-serif text-stone-300 leading-relaxed italic pr-10">
                        "วิถีแห่งผู้ชนะไม่ได้วัดกันที่ความเร็ว แต่คือความมั่นคงของจิตใจ"
                    </p>
                    <p className="text-sm font-bold text-[#C5A059] uppercase tracking-widest pt-2">
                        BODY & MIND MASTERY
                    </p>
                </div>
            </div>

            {/* --- RIGHT PANEL: Login Form --- */}
            <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#FAFAF9] via-[#F4F1ED] to-[#EAE3DE]">

                {/* Dynamic Ambient Backgrounds for Right Panel */}
                <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#C5A059]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/4 translate-x-1/4 animate-pulse-slow"></div>

                <div className="w-full max-w-sm lg:max-w-md xl:max-w-sm 2xl:max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-500 border border-white relative overflow-hidden animate-in fade-in zoom-in duration-500 z-10">

                    <div className="text-center mb-8 relative z-10">
                        {/* Mobile Logo shows only on small screens */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-xl bg-stone-900 animate-float">
                                <Image
                                    src="/images/logo1.png"
                                    alt="Logo"
                                    fill
                                    className="object-cover scale-110"
                                />
                            </div>
                        </div>

                        <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/80 border border-stone-100 text-[10px] font-bold text-stone-400 tracking-widest uppercase shadow-sm">
                            Welcome Back
                        </div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight uppercase">
                            Sign <span className="text-[#C5A059]">In</span>
                        </h1>
                        <p className="text-stone-500 mt-2 text-sm font-light leading-relaxed">Enter your credentials to continue your journey.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium animate-fade-in z-10 relative">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Username / Email Field */}
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-stone-400 group-focus-within:text-[#C5A059] transition-colors pointer-events-none">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/60 rounded-2xl text-sm placeholder-stone-400 text-stone-800 transition-all focus:bg-white focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/10 outline-none hover:bg-white/90"
                                    placeholder="Username or Email"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-stone-400 group-focus-within:text-[#C5A059] transition-colors pointer-events-none">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/60 rounded-2xl text-sm placeholder-stone-400 text-stone-800 transition-all focus:bg-white focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/10 outline-none hover:bg-white/90"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm px-1 py-1">
                            <label className="flex items-center gap-2 cursor-pointer group hover:text-stone-700 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059] focus:ring-offset-0 transition-colors cursor-pointer bg-white"
                                />
                                <span className="text-stone-500 font-medium group-hover:text-stone-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-stone-400 font-medium hover:text-[#C5A059] transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 bg-stone-900 hover:bg-[#C5A059] text-white py-3.5 mt-2 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#C5A059]/20 hover:-translate-y-0.5 group"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Log In</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-stone-200/50 text-center relative z-10 w-full flex items-center justify-center">
                        <p className="text-sm text-stone-500 font-medium flex items-center gap-1">
                            Don't have an account?
                            <a href="#" className="text-stone-900 font-bold hover:text-[#C5A059] transition-colors inline-flex items-center group">
                                Sign up <ArrowRight size={14} className="ml-0.5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
