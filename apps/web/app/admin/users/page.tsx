'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Search,
    MoreHorizontal,
    Shield,
    ShieldAlert,
    UserCheck,
    UserX,
    Trash2,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    XCircle,
    Loader2,
    Mail,
    UserCog,
    UserPlus,
    X,
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

// --- Types ---
interface User {
    id: string;
    username: string;
    email: string | null;
    nickname: string;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
    avatarUrl: string | null;
    lastLogin: string | null;
    createdAt: string;
}

const roleConfig = {
    ADMIN: { label: 'Admin', icon: ShieldAlert, bgClass: 'bg-amber-500/10', textClass: 'text-amber-500' },
    USER: { label: 'User', icon: UserCheck, bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500' },
};

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'createdAt' | 'nickname'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ type: 'role' | 'status' | 'delete', userId: string, newValue?: any } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Add User State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ username: '', email: '', password: '', nickname: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => { setMounted(true); fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            // Using admin users endpoint
            const res = await fetch(`${apiUrl}/admin/users`, {
                credentials: 'include', // 🍪 Browser ส่ง Cookie ไปให้ API อัตโนมัติ
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            setUsers(await res.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!confirmModal) return;
        try {
            setActionLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const { type, userId, newValue } = confirmModal;

            if (type === 'role') {
                const res = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // 🍪 Cookie auth
                    body: JSON.stringify({ role: newValue })
                });
                if (!res.ok) throw new Error('Failed to update role');
                setUsers(users.map(u => u.id === userId ? { ...u, role: newValue } : u));
            }
            else if (type === 'status') {
                const res = await fetch(`${apiUrl}/admin/users/${userId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // 🍪 Cookie auth
                    body: JSON.stringify({ isActive: newValue })
                });
                if (!res.ok) throw new Error('Failed to update status');
                setUsers(users.map(u => u.id === userId ? { ...u, isActive: newValue } : u));
            }
            else if (type === 'delete') {
                const res = await fetch(`${apiUrl}/admin/users/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include', // 🍪 Cookie auth
                });
                if (!res.ok) throw new Error('Failed to delete user');
                setUsers(users.filter(u => u.id !== userId));
            }

            setConfirmModal(null);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(null);
        if (!addForm.username || !addForm.email || !addForm.password || !addForm.nickname) {
            setAddError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }
        try {
            setAddLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addForm)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'บันทึกไม่สำเร็จ');
            }

            // Successfully added user, refresh list
            await fetchUsers();
            setShowAddModal(false);
            setAddForm({ username: '', email: '', password: '', nickname: '' });
        } catch (err: unknown) {
            setAddError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างบัญชี');
        } finally {
            setAddLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let result = [...users];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.nickname.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q) ||
                (u.email && u.email.toLowerCase().includes(q))
            );
        }
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }
        result.sort((a, b) => {
            const cmp = sortField === 'createdAt'
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : a.nickname.localeCompare(b.nickname);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [users, searchQuery, roleFilter, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter]);

    const toggleSort = (field: 'createdAt' | 'nickname') => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        active: users.filter(u => u.isActive).length,
    }), [users]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ===== Header & Stats ===== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>Users</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการบัญชีผู้ใช้งานระบบทั้งหมด</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
                    >
                        <UserPlus size={16} /> Add User
                    </button>
                    {!loading && !error && (
                        <div className="px-4 py-2 rounded-xl hidden sm:block" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Active</p>
                            <p className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>{stats.active}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Filters ===== */}
            <div
                className="rounded-2xl p-4 space-y-4"
                style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 100ms both' : 'none' }}
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 group transition-all duration-300" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
                        <Search size={16} style={{ color: 'var(--admin-muted)' }} className="flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อผู้ใช้, อีเมล..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full"
                            style={{ color: 'var(--admin-fg)' }}
                        />
                    </div>
                    <button
                        onClick={() => toggleSort('createdAt')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all"
                        style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
                    >
                        <ArrowUpDown size={14} />
                        {sortField === 'createdAt' ? 'วันที่สมัคร' : 'ชื่อผู้ใช้'}
                        <span style={{ color: 'var(--admin-muted)' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['ALL', 'USER', 'ADMIN'].map((role) => {
                        const isActive = roleFilter === role;
                        const config = role !== 'ALL' ? roleConfig[role as keyof typeof roleConfig] : null;
                        return (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role as any)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${isActive ? (role === 'ALL' ? '' : `${config!.bgClass} ${config!.textClass}`) : ''}`}
                                style={{
                                    color: isActive ? undefined : 'var(--admin-muted)',
                                    backgroundColor: isActive && role === 'ALL' ? 'var(--admin-hover)' : undefined,
                                }}
                            >
                                {role === 'ALL' ? <Users size={14} /> : React.createElement(config!.icon, { size: 14 })}
                                {role === 'ALL' ? 'All Roles' : config!.label}
                                <span className={isActive ? 'opacity-80' : 'opacity-40'}>
                                    {role === 'ALL' ? stats.total : role === 'ADMIN' ? stats.admins : stats.total - stats.admins}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ===== Table ===== */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms both' : 'none' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-[#C5A059]" />
                        <span className="ml-3 text-sm" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดรายชื่อ...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <XCircle size={32} className="text-red-400 mb-3" />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
                        <button onClick={fetchUsers} className="mt-3 text-xs font-semibold text-[#C5A059] hover:underline">ลองใหม่อีกครั้ง</button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users size={32} className="mb-3" style={{ color: 'var(--admin-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--admin-fg-secondary)' }}>ไม่พบผู้ใช้งาน</p>
                        {searchQuery && <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <th className="text-left py-3.5 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                                            <button onClick={() => toggleSort('nickname')} className="flex items-center gap-1 hover:opacity-70 transition-opacity"><span>User</span><ArrowUpDown size={12} className="opacity-40" /></button>
                                        </th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Role</th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>Status</th>
                                        <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--admin-muted)' }}>
                                            <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:opacity-70 transition-opacity"><span>Joined</span><ArrowUpDown size={12} className="opacity-40" /></button>
                                        </th>
                                        <th className="text-right py-3.5 px-6 w-[80px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user, i) => {
                                        const rConf = roleConfig[user.role];
                                        const RIcon = rConf.icon;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="group transition-colors duration-150"
                                                style={{ borderBottom: '1px solid var(--admin-border)', animation: mounted ? `row-enter 0.4s ease ${300 + i * 50}ms both` : 'none' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                {/* User Info */}
                                                <td className="py-3.5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatarUrl ? (
                                                            <img src={getFullUrl(user.avatarUrl)} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8a6042] flex items-center justify-center text-sm font-bold text-white shadow-[#C5A059]/10">
                                                                {user.nickname[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-semibold truncate" style={{ color: 'var(--admin-fg)' }}>{user.nickname}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[11px] truncate" style={{ color: 'var(--admin-muted)' }}>@{user.username}</span>
                                                                {user.email && (
                                                                    <>
                                                                        <span style={{ color: 'var(--admin-border-hover)' }}>•</span>
                                                                        <span className="text-[11px] truncate flex items-center gap-0.5" style={{ color: 'var(--admin-muted)' }}>
                                                                            <Mail size={10} /> {user.email}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${rConf.bgClass} ${rConf.textClass}`}>
                                                        <RIcon size={12} />{rConf.label}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${user.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                        {user.isActive ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>

                                                {/* Joined Date */}
                                                <td className="py-3.5 px-4 hidden sm:table-cell">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs" style={{ color: 'var(--admin-fg-secondary)' }}>
                                                            {new Date(user.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {user.lastLogin && (
                                                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--admin-muted)' }}>
                                                                <Clock size={10} /> {new Date(user.lastLogin).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-6 text-right relative">
                                                    <button onClick={() => setOpenMenuId(user.id)}
                                                        className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--admin-muted)' }}>
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
                                <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ color: 'var(--admin-muted)' }}>
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage ? 'bg-[#C5A059]/15 text-[#C5A059]' : ''}`}
                                            style={page !== currentPage ? { color: 'var(--admin-muted)' } : undefined}>
                                            {page}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ color: 'var(--admin-muted)' }}>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ===== Actions Modal ===== */}
            {openMenuId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpenMenuId(null)} />
                    <div className="relative rounded-2xl w-full max-w-sm shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
                        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--admin-border)' }}>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>User Actions</h3>
                            <button onClick={() => setOpenMenuId(null)} className="p-1.5 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-hover)] transition-colors"><X size={18} /></button>
                        </div>
                        {(() => {
                            const user = users.find(u => u.id === openMenuId);
                            if (!user) return null;
                            return (
                                <div className="p-3 space-y-1">
                                    {/* Role Toggle */}
                                    <button
                                        onClick={() => { setConfirmModal({ type: 'role', userId: user.id, newValue: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }); setOpenMenuId(null); }}
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--admin-hover)] group w-full text-left" style={{ color: 'var(--admin-fg-secondary)' }}
                                    >
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"><UserCog size={18} /></div>
                                        <span className="font-semibold text-sm group-hover:text-[var(--admin-fg)]">เปลี่ยนเป็น {user.role === 'ADMIN' ? 'User' : 'Admin'}</span>
                                    </button>

                                    {/* Status Toggle */}
                                    <button
                                        onClick={() => { setConfirmModal({ type: 'status', userId: user.id, newValue: !user.isActive }); setOpenMenuId(null); }}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--admin-hover)] group w-full text-left ${user.isActive ? 'text-amber-500' : 'text-emerald-500'}`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${user.isActive ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white' : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                                            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </div>
                                        <span className="font-semibold text-sm group-hover:text-[var(--admin-fg)]">{user.isActive ? 'ระงับบัญชี (Suspend)' : 'ปลดระงับ (Unban)'}</span>
                                    </button>

                                    <div className="my-2 border-t" style={{ borderColor: 'var(--admin-border)' }} />

                                    {/* Delete */}
                                    <button
                                        onClick={() => { setConfirmModal({ type: 'delete', userId: user.id }); setOpenMenuId(null); }}
                                        className="flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-500/[0.06] rounded-xl transition-colors w-full text-left group"
                                    >
                                        <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500 group-hover:text-white transition-colors"><Trash2 size={18} /></div>
                                        <span className="font-semibold text-sm">ลบผู้ใช้ถาวร</span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ===== Action Confirmation Modal ===== */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !actionLoading && setConfirmModal(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-modal-enter" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
              ${confirmModal.type === 'delete' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                            {confirmModal.type === 'delete' ? <Trash2 size={24} /> : confirmModal.type === 'status' ? <UserX size={24} /> : <Shield size={24} />}
                        </div>

                        <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--admin-fg)' }}>
                            {confirmModal.type === 'delete' ? 'ยืนยันการลบบัญชี?' : confirmModal.type === 'role' ? 'ยืนยันเปลี่ยนสิทธิ์?' : 'ยืนยันเปลี่ยนสถานะ?'}
                        </h3>

                        <p className="text-sm text-center mb-6" style={{ color: 'var(--admin-muted)' }}>
                            {confirmModal.type === 'delete'
                                ? 'การลบบัญชีจะลบข้อมูลทั้งหมดที่เกี่ยวข้อง ไม่สามารถเรียกคืนได้'
                                : `คุณแน่ใจหรือไม่ที่จะอัปเดตข้อมูลผู้ใช้นี้`}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)} disabled={actionLoading}
                                className="flex-1 py-4 md:py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                                style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAction} disabled={actionLoading}
                                className={`flex-1 flex justify-center items-center gap-2 py-4 md:py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg disabled:opacity-70
                  ${confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-[#C5A059] hover:bg-[#b58d60] shadow-[#C5A059]/20'}`}
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                ยืนยันทำรายการ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Add User Modal ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !addLoading && setShowAddModal(false)} />
                    <div className="relative rounded-2xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
                                    <UserPlus size={16} />
                                </div>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--admin-fg)' }}>Add New User</h2>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)} disabled={addLoading}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--admin-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddUser} className="p-5 space-y-4 relative">
                            {addError && (
                                <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-xs font-semibold">
                                    <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{addError}</p>
                                </div>
                            )}

                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                        Username <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text" required
                                        value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                                        placeholder="john_doe"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                        Nickname <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text" required
                                        value={addForm.nickname} onChange={e => setAddForm({ ...addForm, nickname: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email" required
                                        value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-muted)' }}>
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="password" required minLength={8}
                                        value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                        placeholder="อย่างน้อย 8 ตัวอักษร"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                        style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2" style={{ borderTop: '1px dashed var(--admin-border)' }}>
                                <button
                                    type="button" onClick={() => setShowAddModal(false)} disabled={addLoading}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                    style={{ color: 'var(--admin-fg-secondary)', backgroundColor: 'var(--admin-hover)' }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit" disabled={addLoading}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
                                >
                                    {addLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                    เพิ่มผู้ใช้งาน
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes row-enter { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes dropdown { from { opacity: 0; transform: translateY(-4px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-dropdown { animation: dropdown 0.15s ease forwards; }
        .animate-modal-enter { animation: modal-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.2s ease forwards; }
      `}</style>
        </div>
    );
}
