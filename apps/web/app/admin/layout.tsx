'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    PenSquare,
    Image as ImageIcon,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Bell,
    Search,
    Sun,
    Moon,
    Folder,
    Briefcase,
    Tag,
    MapPin,
    Cpu,
    AlertTriangle,
} from 'lucide-react';

// ====== Theme Context ======
type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => { } });

export function useAdminTheme() {
    return useContext(ThemeContext);
}

// --- Sidebar Menu Items ---
const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Posts', href: '/admin/posts', icon: FileText },
    { label: 'Create Post', href: '/admin/createPost', icon: PenSquare },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Documents', href: '/admin/documents', icon: Folder },
    { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Resume', href: '/admin/resume', icon: Briefcase },
    { label: 'Users', href: '/admin/users', icon: Users },
];

const iotMenuItems = [
    { label: 'Live Map', href: '/admin/map', icon: MapPin },
    { label: 'Devices', href: '/admin/devices', icon: Cpu },
    { label: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
];

const bottomMenuItems = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<Theme>('dark');

    // Auth State
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState<{ username: string; role: string } | null>(null);

    // 🍪 ตรวจสอบ Auth โดยใช้ Cookie ที่ Browser เก็บไว้ (ไม่ต้องดึง token จาก localStorage)
    useEffect(() => {
        const checkAuth = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            try {
                // Browser จะส่ง HttpOnly Cookie ไปให้ API อัตโนมัติ
                const res = await fetch(`${apiUrl}/auth/me`, {
                    credentials: 'include', // 🔑 สำคัญมาก!
                });

                if (!res.ok) {
                    // Cookie หมดอายุ หรือไม่ได้ Login ไว้
                    // ลอง refresh ก่อน redirect
                    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include', // Browser ส่ง refresh_token Cookie ไปด้วย
                    });

                    if (!refreshRes.ok) {
                        router.push('/login');
                        return;
                    }

                    // Refresh สำเร็จ ลองเช็ค profile อีกครั้ง
                    const retryRes = await fetch(`${apiUrl}/auth/me`, {
                        credentials: 'include',
                    });

                    if (!retryRes.ok) {
                        router.push('/login');
                        return;
                    }

                    const data = await retryRes.json();
                    if (data.role !== 'ADMIN') {
                        router.push('/');
                        return;
                    }
                    setUserProfile(data);
                    setIsAuthenticated(true);
                    return;
                }

                const data = await res.json();

                // Only allow ADMIN role
                if (data.role !== 'ADMIN') {
                    router.push('/');
                } else {
                    setUserProfile(data);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Auth verification failed:', err);
                router.push('/login');
            } finally {
                setIsLoadingAuth(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            // 🍪 เรียก API เพื่อ ลบ Cookie ฝั่ง Server และ Revoke token ใน Database
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include', // ส่ง access_token Cookie ไปด้วยเพื่อผ่าน JwtAuthGuard
            });
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            // ✅ ไม่ต้อง clearItem ใน localStorage อีกต่อไป เพราะ API จะ clearCookie ให้เอง
            router.push('/');
        }
    };

    useEffect(() => {
        setMounted(true);
        // Restore theme from localStorage
        const saved = localStorage.getItem('admin-theme') as Theme | null;
        if (saved) setTheme(saved);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('admin-theme', next);
            return next;
        });
    };

    // Show loading spinner while checking auth to prevent UI flash
    if (!mounted || isLoadingAuth) {
        return (
            <div className="flex h-screen w-screen items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#0f0f10' : '#f5f3f0' }}>
                <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin" />
            </div>
        );
    }

    // Do not render if not authenticated
    if (!isAuthenticated) return null;

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div
                className="flex h-screen overflow-hidden transition-colors duration-300"
                style={{
                    // ===== CSS Variables for theme =====
                    '--admin-bg': isDark ? '#0f0f10' : '#f5f3f0',
                    '--admin-card': isDark ? '#161618' : '#ffffff',
                    '--admin-card-alt': isDark ? '#1a1a1c' : '#fafaf9',
                    '--admin-fg': isDark ? '#e7e5e4' : '#1c1917',
                    '--admin-fg-secondary': isDark ? '#a8a29e' : '#57534e',
                    '--admin-muted': isDark ? '#78716c' : '#a8a29e',
                    '--admin-border': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                    '--admin-border-hover': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
                    '--admin-hover': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    '--admin-active-bg': isDark ? 'rgba(197,160,89,0.1)' : 'rgba(197,160,89,0.12)',
                    '--admin-accent': '#C5A059',
                    '--admin-accent-hover': '#b58d60',
                    '--admin-sidebar': isDark ? '#161618' : '#ffffff',
                    '--admin-header': isDark ? 'rgba(15,15,16,0.8)' : 'rgba(255,255,255,0.85)',
                    backgroundColor: 'var(--admin-bg)',
                    color: 'var(--admin-fg)',
                } as React.CSSProperties}
            >
                {/* ===== Mobile Overlay ===== */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* ===== Sidebar ===== */}
                <aside
                    className={`
            fixed md:relative z-50 h-full flex flex-col
            border-r transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
            ${mobileOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full md:translate-x-0'}
          `}
                    style={{
                        backgroundColor: 'var(--admin-sidebar)',
                        borderColor: 'var(--admin-border)',
                    }}
                >
                    {/* Logo Area */}
                    <div
                        className="h-16 flex items-center px-5 flex-shrink-0"
                        style={{ borderBottom: '1px solid var(--admin-border)' }}
                    >
                        <Link href="/admin/dashboard" className="flex items-center gap-3 group min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8a6042] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C5A059]/10 group-hover:shadow-[#C5A059]/25 transition-shadow duration-300">
                                <span className="text-white text-sm font-black">F</span>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0 animate-sidebar-text">
                                    <span className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--admin-fg)' }}>
                                        Family JS
                                    </span>
                                    <span className="text-[10px] text-[#C5A059] font-semibold tracking-widest uppercase">
                                        Admin
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Mobile close */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="ml-auto md:hidden transition-colors"
                            style={{ color: 'var(--admin-muted)' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
                        <div
                            className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${collapsed ? 'text-center' : 'px-3'}`}
                            style={{ color: 'var(--admin-muted)' }}
                        >
                            {collapsed ? '•••' : 'Menu'}
                        </div>
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                    style={{
                                        backgroundColor: isActive ? 'var(--admin-active-bg)' : 'transparent',
                                        color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                            e.currentTarget.style.color = 'var(--admin-fg)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--admin-muted)';
                                        }
                                    }}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C5A059] rounded-r-full animate-scale-in" />
                                    )}
                                    <Icon
                                        size={20}
                                        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                        style={{ color: isActive ? 'var(--admin-accent)' : undefined }}
                                    />
                                    {!collapsed && (
                                        <span className="truncate animate-sidebar-text">{item.label}</span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* IoT Section */}
                        <div
                            className={`text-[10px] font-bold uppercase tracking-widest mt-5 mb-3 ${collapsed ? 'text-center' : 'px-3'}`}
                            style={{ color: 'var(--admin-muted)' }}
                        >
                            {collapsed ? '📡' : 'IoT Tracker'}
                        </div>
                        {iotMenuItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                    style={{
                                        backgroundColor: isActive ? 'var(--admin-active-bg)' : 'transparent',
                                        color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                            e.currentTarget.style.color = 'var(--admin-fg)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--admin-muted)';
                                        }
                                    }}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C5A059] rounded-r-full animate-scale-in" />
                                    )}
                                    <Icon
                                        size={20}
                                        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                        style={{ color: isActive ? 'var(--admin-accent)' : undefined }}
                                    />
                                    {!collapsed && (
                                        <span className="truncate animate-sidebar-text">{item.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="py-4 px-3 space-y-1" style={{ borderTop: '1px solid var(--admin-border)' }}>
                        {bottomMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                    style={{
                                        backgroundColor: isActive ? 'var(--admin-active-bg)' : 'transparent',
                                        color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                                    }}
                                >
                                    <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className={`
                w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
              `}
                            style={{ color: 'var(--admin-muted)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#f87171';
                                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--admin-muted)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <LogOut size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                            {!collapsed && <span className="truncate">Logout</span>}
                        </button>

                        {/* Collapse toggle (Desktop only) */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={`hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 justify-center mt-2`}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            style={{ color: 'var(--admin-muted)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                e.currentTarget.style.color = 'var(--admin-fg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--admin-muted)';
                            }}
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                            {!collapsed && <span className="truncate">Collapse</span>}
                        </button>
                    </div>
                </aside>

                {/* ===== Main Content Area ===== */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Header Bar */}
                    <header
                        className="h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-xl flex-shrink-0 z-30"
                        style={{
                            backgroundColor: 'var(--admin-header)',
                            borderBottom: '1px solid var(--admin-border)',
                        }}
                    >
                        {/* Left: Mobile menu + Search */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden transition-colors p-1"
                                style={{ color: 'var(--admin-muted)' }}
                            >
                                <Menu size={22} />
                            </button>
                            <div
                                className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 w-64 group transition-all duration-300"
                                style={{
                                    backgroundColor: 'var(--admin-hover)',
                                    border: '1px solid var(--admin-border)',
                                }}
                            >
                                <Search size={16} style={{ color: 'var(--admin-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="bg-transparent text-sm outline-none w-full"
                                    style={{ color: 'var(--admin-fg)' }}
                                />
                            </div>
                        </div>

                        {/* Right: Theme toggle + Notifications + Profile */}
                        <div className="flex items-center gap-2">
                            {/* ===== THEME TOGGLE ===== */}
                            <button
                                onClick={toggleTheme}
                                className="relative p-2 rounded-xl transition-all duration-300 overflow-hidden group"
                                style={{
                                    color: 'var(--admin-muted)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                    e.currentTarget.style.color = 'var(--admin-fg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--admin-muted)';
                                }}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                <div className="relative w-5 h-5">
                                    <Sun
                                        size={20}
                                        className={`absolute inset-0 transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                                    />
                                    <Moon
                                        size={20}
                                        className={`absolute inset-0 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                                    />
                                </div>
                            </button>

                            <button
                                className="relative p-2 rounded-xl transition-all duration-200"
                                style={{ color: 'var(--admin-muted)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--admin-hover)';
                                    e.currentTarget.style.color = 'var(--admin-fg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--admin-muted)';
                                }}
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C5A059] rounded-full animate-pulse" />
                            </button>

                            <div className="w-px h-6 hidden sm:block" style={{ backgroundColor: 'var(--admin-border)' }} />

                            <div className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A059] to-[#714e38] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-[#C5A059]/10 group-hover:shadow-[#C5A059]/25 transition-shadow">
                                    {userProfile?.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--admin-fg)' }}>{userProfile?.username || 'Admin'}</span>
                                    <span className="text-[11px] leading-tight uppercase font-semibold text-[#C5A059]">Administrator</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                        <div className="animate-page-enter">
                            {children}
                        </div>
                    </main>
                </div>

                {/* ===== Custom Styles ===== */}
                <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { transform: translateY(-50%) scaleY(0); }
            to { transform: translateY(-50%) scaleY(1); }
          }
          @keyframes sidebar-text {
            from { opacity: 0; transform: translateX(-8px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes page-enter {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-sidebar-text { animation: sidebar-text 0.2s ease-out forwards; }
          .animate-page-enter { animation: page-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .scrollbar-none::-webkit-scrollbar { display: none; }
          .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

          /* Select option styling for dark/light */
          select option {
            background-color: var(--admin-card);
            color: var(--admin-fg);
          }
        `}</style>
            </div>
        </ThemeContext.Provider>
    );
}
