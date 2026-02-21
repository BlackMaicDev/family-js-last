'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Eye,
    FileText,
    Users,
    Image as ImageIcon,
    ArrowUpRight,
    Clock,
    Calendar,
    BarChart3,
    Activity,
    PenSquare,
    Upload,
    UserPlus,
} from 'lucide-react';

// --- Stat Card Data ---
const stats = [
    { label: 'Total Views', value: '12,489', change: '+12.5%', trend: 'up' as const, icon: Eye, color: '#C5A059' },
    { label: 'Total Posts', value: '48', change: '+3', trend: 'up' as const, icon: FileText, color: '#6EE7B7' },
    { label: 'Active Users', value: '1,024', change: '-2.4%', trend: 'down' as const, icon: Users, color: '#93C5FD' },
    { label: 'Gallery Items', value: '256', change: '+18', trend: 'up' as const, icon: ImageIcon, color: '#F9A8D4' },
];

// --- Recent Posts ---
const recentPosts = [
    { title: 'เทคนิคการเลี้ยงลูกแบบ Positive Parenting', date: '2 ชั่วโมงที่แล้ว', status: 'published', views: 342 },
    { title: 'Body & Mind Development สำหรับเด็ก', date: '5 ชั่วโมงที่แล้ว', status: 'draft', views: 0 },
    { title: 'กิจกรรมครอบครัวช่วงวันหยุด', date: 'เมื่อวาน', status: 'published', views: 891 },
    { title: 'เคล็ดลับสร้างสุขภาพที่ดีในครอบครัว', date: '3 วันที่แล้ว', status: 'published', views: 1204 },
    { title: 'Mindfulness สำหรับเด็กเล็ก', date: '5 วันที่แล้ว', status: 'published', views: 567 },
];

// --- Quick Actions ---
const quickActions = [
    { label: 'New Post', icon: PenSquare, href: '/admin/createPost', color: '#C5A059' },
    { label: 'Upload Media', icon: Upload, href: '/admin/gallery', color: '#6EE7B7' },
    { label: 'Add User', icon: UserPlus, href: '/admin/users', color: '#93C5FD' },
];

// --- Chart Bar Data (mock) ---
const chartData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 72 },
    { day: 'Wed', value: 56 },
    { day: 'Thu', value: 88 },
    { day: 'Fri', value: 64 },
    { day: 'Sat', value: 93 },
    { day: 'Sun', value: 78 },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const maxChartValue = Math.max(...chartData.map((d) => d.value));

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* ===== Page Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>
                        Dashboard
                    </h1>
                    <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--admin-muted)' }}>
                        <Calendar size={14} />
                        {new Date().toLocaleDateString('th-TH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5"
                        style={{
                            color: 'var(--admin-fg-secondary)',
                            backgroundColor: 'var(--admin-hover)',
                            border: '1px solid var(--admin-border)',
                        }}
                    >
                        <Clock size={14} />
                        Last 7 days
                    </button>
                    <button className="px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all duration-200 shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/25 flex items-center gap-1.5">
                        <BarChart3 size={14} />
                        View Report
                    </button>
                </div>
            </div>

            {/* ===== Stat Cards ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="group relative rounded-2xl p-5 transition-all duration-300 overflow-hidden"
                            style={{
                                backgroundColor: 'var(--admin-card)',
                                border: '1px solid var(--admin-border)',
                                animation: mounted ? `card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms both` : 'none',
                            }}
                        >
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: `radial-gradient(300px circle at 50% 0%, ${stat.color}10, transparent 70%)`,
                                }}
                            />
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>
                                        {stat.value}
                                    </p>
                                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {stat.change}
                                        <span className="font-normal ml-0.5" style={{ color: 'var(--admin-muted)' }}>vs last week</span>
                                    </div>
                                </div>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    <Icon size={20} style={{ color: stat.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===== Chart + Quick Actions Row ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart */}
                <div
                    className="lg:col-span-2 rounded-2xl p-5 md:p-6"
                    style={{
                        backgroundColor: 'var(--admin-card)',
                        border: '1px solid var(--admin-border)',
                        animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 350ms both' : 'none',
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--admin-fg)' }}>Weekly Overview</h2>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>Page views this week</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/[0.08] px-2.5 py-1 rounded-lg">
                            <Activity size={14} />
                            +8.2%
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-2 md:gap-3 h-48">
                        {chartData.map((bar, i) => {
                            const heightPercent = (bar.value / maxChartValue) * 100;
                            return (
                                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                                    <span
                                        className="text-[11px] font-semibold opacity-0"
                                        style={{
                                            color: 'var(--admin-fg-secondary)',
                                            animation: mounted ? `fade-in-value 0.3s ease ${600 + i * 60}ms forwards` : 'none',
                                        }}
                                    >
                                        {bar.value}
                                    </span>
                                    <div
                                        className="w-full relative rounded-t-lg overflow-hidden h-full flex items-end"
                                        style={{ backgroundColor: 'var(--admin-hover)' }}
                                    >
                                        <div
                                            className="w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                            style={{
                                                height: mounted ? `${heightPercent}%` : '0%',
                                                background: 'linear-gradient(to top, #C5A059, #C5A059CC)',
                                                transitionDelay: `${400 + i * 80}ms`,
                                                opacity: 0.8,
                                            }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium" style={{ color: 'var(--admin-muted)' }}>{bar.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div
                    className="rounded-2xl p-5 md:p-6"
                    style={{
                        backgroundColor: 'var(--admin-card)',
                        border: '1px solid var(--admin-border)',
                        animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 450ms both' : 'none',
                    }}
                >
                    <h2 className="text-base font-bold mb-4" style={{ color: 'var(--admin-fg)' }}>Quick Actions</h2>
                    <div className="space-y-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <a
                                    key={action.label}
                                    href={action.href}
                                    className="group flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200"
                                    style={{
                                        backgroundColor: 'var(--admin-hover)',
                                        border: '1px solid var(--admin-border)',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                        style={{ backgroundColor: `${action.color}15` }}
                                    >
                                        <Icon size={18} style={{ color: action.color }} />
                                    </div>
                                    <span className="text-sm font-medium transition-colors" style={{ color: 'var(--admin-fg-secondary)' }}>
                                        {action.label}
                                    </span>
                                    <ArrowUpRight
                                        size={16}
                                        className="ml-auto group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                                        style={{ color: 'var(--admin-muted)' }}
                                    />
                                </a>
                            );
                        })}
                    </div>

                    {/* Activity Ring */}
                    <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--admin-muted)' }}>
                            Today&apos;s Activity
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--admin-border)" strokeWidth="3" />
                                    <circle
                                        cx="18" cy="18" r="15.5"
                                        fill="none"
                                        stroke="#C5A059"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray="97.4"
                                        strokeDashoffset={mounted ? '24.35' : '97.4'}
                                        className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                        style={{ transitionDelay: '800ms' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#C5A059]">75%</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg)' }}>3 of 4 tasks</p>
                                <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>completed today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Recent Posts Table ===== */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: 'var(--admin-card)',
                    border: '1px solid var(--admin-border)',
                    animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 550ms both' : 'none',
                }}
            >
                <div className="flex items-center justify-between p-5 md:p-6 pb-0">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: 'var(--admin-fg)' }}>Recent Posts</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>Latest content updates</p>
                    </div>
                    <a href="/admin/posts" className="text-xs font-semibold text-[#C5A059] hover:text-[#d4b872] transition-colors flex items-center gap-1">
                        View all
                        <ArrowUpRight size={14} />
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                <th className="text-left py-3 px-5 md:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Title</th>
                                <th className="text-left py-3 px-5 md:px-6 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--admin-muted)' }}>Date</th>
                                <th className="text-left py-3 px-5 md:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Status</th>
                                <th className="text-right py-3 px-5 md:px-6 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--admin-muted)' }}>Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map((post, i) => (
                                <tr
                                    key={i}
                                    className="cursor-pointer group transition-colors duration-150"
                                    style={{
                                        borderBottom: '1px solid var(--admin-border)',
                                        animation: mounted ? `row-enter 0.4s ease ${700 + i * 60}ms both` : 'none',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-hover)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <td className="py-3.5 px-5 md:px-6">
                                        <span className="font-medium" style={{ color: 'var(--admin-fg-secondary)' }}>{post.title}</span>
                                    </td>
                                    <td className="py-3.5 px-5 md:px-6 hidden md:table-cell" style={{ color: 'var(--admin-muted)' }}>
                                        {post.date}
                                    </td>
                                    <td className="py-3.5 px-5 md:px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 md:px-6 text-right hidden sm:table-cell" style={{ color: 'var(--admin-muted)' }}>
                                        {post.views > 0 ? post.views.toLocaleString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Animations ===== */}
            <style jsx>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes row-enter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-value {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
