'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Edit3, X, Loader2, BookOpen, Layers,
  CheckCircle2, ChevronRight, XCircle, Save, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────
interface GradeLevel {
  id: string;
  name: string;
  description: string | null;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevelId: string | null;
  _count?: { lessons: number; exams: number };
}

// ─── Modal Component ─────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={ref}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl shadow-2xl outline-none"
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--admin-fg)' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--admin-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, loading, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h4 className="font-bold text-base mb-2" style={{ color: 'var(--admin-fg)' }}>ยืนยันการลบ</h4>
        <p className="text-sm mb-6" style={{ color: 'var(--admin-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none transition-all"
          style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
        />
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none transition-all"
          style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminELearningPage() {
  const [grades, setGrades] = useState<GradeLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Grade Modal state
  const [gradeModal, setGradeModal] = useState<'add' | 'edit' | null>(null);
  const [gradeForm, setGradeForm] = useState({ name: '', description: '' });
  const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null);
  const [gradeSaving, setGradeSaving] = useState(false);

  // ── Delete Grade state
  const [deleteGradeId, setDeleteGradeId] = useState<string | null>(null);
  const [deletingGrade, setDeletingGrade] = useState(false);

  // ── Subject Modal state
  const [subjectModal, setSubjectModal] = useState<'add' | 'edit' | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '' });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectSaving, setSubjectSaving] = useState(false);

  // ── Delete Subject state
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [deletingSubject, setDeletingSubject] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => { setMounted(true); fetchGrades(); }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/e-learning/grades`, { credentials: 'include' });
      if (!res.ok) throw new Error('โหลดข้อมูลระดับชั้นไม่สำเร็จ');
      const data = await res.json();
      setGrades(data);
      if (data.length > 0) setActiveGradeId(prev => prev || data[0].id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // ─── Grade CRUD ───────────────────────────────────────────
  const openAddGrade = () => {
    setGradeForm({ name: '', description: '' });
    setEditingGrade(null);
    setGradeModal('add');
  };

  const openEditGrade = (grade: GradeLevel, e: React.MouseEvent) => {
    e.stopPropagation();
    setGradeForm({ name: grade.name, description: grade.description || '' });
    setEditingGrade(grade);
    setGradeModal('edit');
  };

  const saveGrade = async () => {
    if (!gradeForm.name.trim()) return;
    setGradeSaving(true);
    try {
      const isEdit = gradeModal === 'edit' && editingGrade;
      const url = isEdit
        ? `${apiUrl}/e-learning/grades/${editingGrade.id}`
        : `${apiUrl}/e-learning/grades`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: gradeForm.name.trim(), description: gradeForm.description.trim() || undefined }),
      });
      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
      setGradeModal(null);
      showSuccess(isEdit ? 'แก้ไขระดับชั้นสำเร็จ' : 'เพิ่มระดับชั้นสำเร็จ');
      await fetchGrades();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setGradeSaving(false);
    }
  };

  const confirmDeleteGrade = async () => {
    if (!deleteGradeId) return;
    setDeletingGrade(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/grades/${deleteGradeId}`, {
        method: 'DELETE', credentials: 'include',
      });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      setDeleteGradeId(null);
      if (activeGradeId === deleteGradeId) setActiveGradeId(null);
      showSuccess('ลบระดับชั้นสำเร็จ');
      await fetchGrades();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setDeletingGrade(false);
    }
  };

  // ─── Subject CRUD ─────────────────────────────────────────
  const openAddSubject = () => {
    if (!activeGradeId) return;
    setSubjectForm({ name: '', code: '', description: '' });
    setEditingSubject(null);
    setSubjectModal('add');
  };

  const openEditSubject = (sub: Subject) => {
    setSubjectForm({ name: sub.name, code: sub.code || '', description: sub.description || '' });
    setEditingSubject(sub);
    setSubjectModal('edit');
  };

  const saveSubject = async () => {
    if (!subjectForm.name.trim()) return;
    setSubjectSaving(true);
    try {
      const isEdit = subjectModal === 'edit' && editingSubject;
      const url = isEdit
        ? `${apiUrl}/e-learning/subjects/${editingSubject.id}`
        : `${apiUrl}/e-learning/subjects`;
      const body: Record<string, unknown> = {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim() || undefined,
        description: subjectForm.description.trim() || undefined,
      };
      if (!isEdit) body.gradeLevelId = activeGradeId;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
      setSubjectModal(null);
      showSuccess(isEdit ? 'แก้ไขวิชาสำเร็จ' : 'เพิ่มวิชาสำเร็จ');
      await fetchGrades();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubjectSaving(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!deleteSubjectId) return;
    setDeletingSubject(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/subjects/${deleteSubjectId}`, {
        method: 'DELETE', credentials: 'include',
      });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      setDeleteSubjectId(null);
      showSuccess('ลบวิชาสำเร็จ');
      await fetchGrades();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setDeletingSubject(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────
  const activeGrade = grades.find(g => g.id === activeGradeId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-[100] animate-toast-in">
          <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl shadow-black/40 backdrop-blur-md">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Grade Add/Edit Modal */}
      <Modal
        open={!!gradeModal}
        onClose={() => setGradeModal(null)}
        title={gradeModal === 'edit' ? 'แก้ไขระดับชั้น' : 'เพิ่มระดับชั้นใหม่'}
      >
        <div className="space-y-4">
          <Field label="ชื่อระดับชั้น" value={gradeForm.name} onChange={v => setGradeForm(p => ({ ...p, name: v }))} placeholder="เช่น ม.1, ม.2, ปริญญาตรี" required />
          <Field label="คำอธิบาย" value={gradeForm.description} onChange={v => setGradeForm(p => ({ ...p, description: v }))} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" type="textarea" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setGradeModal(null)} disabled={gradeSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>
              ยกเลิก
            </button>
            <button onClick={saveGrade} disabled={gradeSaving || !gradeForm.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#C5A059] hover:bg-[#b58d60] text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {gradeSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
            </button>
          </div>
        </div>
      </Modal>

      {/* Subject Add/Edit Modal */}
      <Modal
        open={!!subjectModal}
        onClose={() => setSubjectModal(null)}
        title={subjectModal === 'edit' ? 'แก้ไขรายวิชา' : `เพิ่มวิชาใหม่ใน ${activeGrade?.name || ''}`}
      >
        <div className="space-y-4">
          <Field label="ชื่อวิชา" value={subjectForm.name} onChange={v => setSubjectForm(p => ({ ...p, name: v }))} placeholder="เช่น คณิตศาสตร์ประยุกต์ 1" required />
          <Field label="รหัสวิชา" value={subjectForm.code} onChange={v => setSubjectForm(p => ({ ...p, code: v }))} placeholder="เช่น MATH101 (ไม่บังคับ)" />
          <Field label="คำอธิบาย" value={subjectForm.description} onChange={v => setSubjectForm(p => ({ ...p, description: v }))} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" type="textarea" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setSubjectModal(null)} disabled={subjectSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>
              ยกเลิก
            </button>
            <button onClick={saveSubject} disabled={subjectSaving || !subjectForm.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#C5A059] hover:bg-[#b58d60] text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {subjectSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Grade */}
      <ConfirmModal
        open={!!deleteGradeId}
        onClose={() => setDeleteGradeId(null)}
        onConfirm={confirmDeleteGrade}
        loading={deletingGrade}
        message="การลบระดับชั้นจะลบรายวิชาและเนื้อหาทั้งหมดภายในด้วย ไม่สามารถกู้คืนได้"
      />

      {/* Confirm Delete Subject */}
      <ConfirmModal
        open={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        onConfirm={confirmDeleteSubject}
        loading={deletingSubject}
        message="การลบวิชาจะลบบทเรียนและข้อสอบทั้งหมดที่ผูกอยู่ด้วย ไม่สามารถกู้คืนได้"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>
            E-Learning Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
            จัดการระดับชั้น, วิชาเรียน และบทเรียน
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/exams" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ring-1 ring-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059]/10">
            ไปหน้าคลังข้อสอบ <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
          <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
          <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลด...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
          <XCircle size={40} className="text-red-400 mb-4" />
          <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>{error}</p>
          <button onClick={fetchGrades} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C5A059] rounded-xl hover:bg-[#b58d60] transition-all">ลองใหม่</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* ── Grade Sidebar ────────────────────────────── */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--admin-fg)' }}>ระดับชั้น (Grades)</h2>
              <button
                onClick={openAddGrade}
                className="flex items-center gap-1 text-[#C5A059] hover:bg-[#C5A059]/10 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
              >
                <Plus size={13} /> เพิ่ม
              </button>
            </div>

            {grades.map(grade => (
              <div
                key={grade.id}
                onClick={() => setActiveGradeId(grade.id)}
                className="p-3 rounded-xl cursor-pointer border transition-all flex justify-between items-center group"
                style={{
                  backgroundColor: activeGradeId === grade.id ? '#C5A059' : 'var(--admin-card)',
                  borderColor: activeGradeId === grade.id ? 'transparent' : 'var(--admin-border)',
                  color: activeGradeId === grade.id ? '#fff' : 'var(--admin-fg)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers size={15} className={activeGradeId === grade.id ? 'text-white/80 shrink-0' : 'text-[var(--admin-muted)] shrink-0'} />
                  <span className="text-sm font-bold truncate">{grade.name}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    onClick={e => openEditGrade(grade, e)}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 ${activeGradeId === grade.id ? 'text-white' : 'text-blue-400'}`}
                    title="แก้ไข"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteGradeId(grade.id); }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 ${activeGradeId === grade.id ? 'text-white' : 'text-red-400'}`}
                    title="ลบ"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight size={14} className={`transition-transform ${activeGradeId === grade.id ? 'text-white/60' : 'text-[var(--admin-muted)] group-hover:translate-x-0.5'}`} />
                </div>
              </div>
            ))}

            {grades.length === 0 && (
              <div className="text-center py-8 rounded-xl border border-dashed" style={{ borderColor: 'var(--admin-border)' }}>
                <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>ยังไม่มีระดับชั้น</p>
                <button onClick={openAddGrade} className="mt-2 text-[11px] text-[#C5A059] font-semibold hover:underline">+ เพิ่มระดับชั้นแรก</button>
              </div>
            )}
          </div>

          {/* ── Subjects Grid ─────────────────────────────── */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--admin-fg)' }}>
                รายวิชา {activeGrade ? `ใน ${activeGrade.name}` : ''}
              </h2>
              <button
                onClick={openAddSubject}
                disabled={!activeGradeId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs text-white bg-[#C5A059] shadow-md shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> เพิ่มวิชา
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGrade?.subjects && activeGrade.subjects.length > 0 ? (
                activeGrade.subjects.map((sub, i) => (
                  <div
                    key={sub.id}
                    className="rounded-2xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                    style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? `card-enter 0.4s ease ${i * 60}ms both` : 'none' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--admin-fg)' }}>{sub.name}</h3>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--admin-muted)' }}>{sub.code || 'ไม่มีรหัสวิชา'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditSubject(sub)}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="แก้ไขวิชา"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteSubjectId(sub.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          title="ลบวิชา"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--admin-border)' }}>
                      <div className="flex gap-3 text-[11px] font-semibold" style={{ color: 'var(--admin-muted)' }}>
                        <span>บทเรียน: {sub._count?.lessons ?? '?'}</span>
                        <span>ข้อสอบ: {sub._count?.exams ?? '?'}</span>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/e-learning/subjects/${sub.id}/lessons`}
                          className="text-[11px] font-bold text-blue-400 hover:underline"
                        >
                          บทเรียน →
                        </Link>
                        <Link
                          href={`/admin/exams?subjectId=${sub.id}`}
                          className="text-[11px] font-bold text-[#C5A059] hover:underline"
                        >
                          ข้อสอบ →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-10 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--admin-border)' }}>
                  <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--admin-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--admin-fg)' }}>
                    {activeGrade ? 'ยังไม่มีรายวิชาในระดับชั้นนี้' : 'เลือกระดับชั้นทางซ้ายก่อน'}
                  </p>
                  {activeGrade && (
                    <button onClick={openAddSubject} className="mt-3 text-sm font-semibold text-[#C5A059] hover:underline">
                      + เพิ่มวิชาแรก
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
