'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Loader2, Search, Filter, Clock, Tag, Save, X, AlertTriangle, ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

interface Subject { id: string; name: string; }
interface ExamType { id: string; name: string; }

interface Exam {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  subject: Subject;
  examType: ExamType | null;
  _count?: { questions: number; attempts: number };
}

// ─── Modal ────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div ref={ref} tabIndex={-1} className="relative w-full max-w-lg rounded-2xl shadow-2xl outline-none max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}>
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

function ConfirmModal({ open, onClose, onConfirm, loading, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl"
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }} onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h4 className="font-bold text-base mb-2" style={{ color: 'var(--admin-fg)' }}>ยืนยันการลบ</h4>
        <p className="text-sm mb-6" style={{ color: 'var(--admin-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required, children }: {
  label: string; value?: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children ?? (
        type === 'textarea' ? (
          <textarea value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} rows={3}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none"
            style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
        ) : (
          <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
            style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
        )
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Exam Modal
  const [examModal, setExamModal] = useState<'add' | 'edit' | null>(null);
  const [examForm, setExamForm] = useState({ title: '', description: '', timeLimit: '', subjectId: '', examTypeId: '' });
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examSaving, setExamSaving] = useState(false);

  // ── Delete Exam
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [deletingExam, setDeletingExam] = useState(false);

  // ── Exam Types Management
  const [typeModal, setTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [typeSaving, setTypeSaving] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => { setMounted(true); fetchAll(); }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [examsRes, subjectsRes, typesRes] = await Promise.all([
        fetch(`${apiUrl}/e-learning/exams`, { credentials: 'include' }),
        fetch(`${apiUrl}/e-learning/subjects`, { credentials: 'include' }),
        fetch(`${apiUrl}/e-learning/exam-types`, { credentials: 'include' }),
      ]);
      if (examsRes.ok) setExams(await examsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (typesRes.ok) setExamTypes(await typesRes.json());
    } finally {
      setLoading(false);
    }
  };

  const openAddExam = () => {
    setExamForm({ title: '', description: '', timeLimit: '', subjectId: subjects[0]?.id || '', examTypeId: '' });
    setEditingExam(null);
    setExamModal('add');
  };

  const openEditExam = (exam: Exam) => {
    setExamForm({
      title: exam.title,
      description: exam.description || '',
      timeLimit: exam.timeLimit?.toString() || '',
      subjectId: exam.subject.id,
      examTypeId: exam.examType?.id || '',
    });
    setEditingExam(exam);
    setExamModal('edit');
  };

  const saveExam = async () => {
    if (!examForm.title.trim() || !examForm.subjectId) return;
    setExamSaving(true);
    try {
      const isEdit = examModal === 'edit' && editingExam;
      const url = isEdit
        ? `${apiUrl}/e-learning/exams/${editingExam.id}`
        : `${apiUrl}/e-learning/exams`;
      const body: Record<string, unknown> = {
        title: examForm.title.trim(),
        description: examForm.description.trim() || undefined,
        subjectId: examForm.subjectId,
        examTypeId: examForm.examTypeId || undefined,
        timeLimit: examForm.timeLimit ? parseInt(examForm.timeLimit) : null,
      };
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
      setExamModal(null);
      showSuccess(isEdit ? 'แก้ไขข้อสอบสำเร็จ' : 'สร้างชุดข้อสอบสำเร็จ');
      await fetchAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setExamSaving(false);
    }
  };

  const confirmDeleteExam = async () => {
    if (!deleteExamId) return;
    setDeletingExam(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/exams/${deleteExamId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      setDeleteExamId(null);
      showSuccess('ลบข้อสอบสำเร็จ');
      await fetchAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setDeletingExam(false);
    }
  };

  const saveType = async () => {
    if (!newTypeName.trim()) return;
    setTypeSaving(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/exam-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newTypeName.trim() })
      });
      if (res.ok) {
        setNewTypeName('');
        showSuccess('เพิ่มประเภทข้อสอบสำเร็จ');
        await fetchAll();
      } else throw new Error();
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setTypeSaving(false);
    }
  };

  const deleteType = async (id: string) => {
    if(!confirm('ยืนยันการลบประเภทนี้หรือไม่?')) return;
    try {
      const res = await fetch(`${apiUrl}/e-learning/exam-types/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        showSuccess('ลบประเภทข้อสอบสำเร็จ');
        await fetchAll();
      } else throw new Error();
    } catch {
      alert('ลบไม่สำเร็จ เพราะข้อสอบบางชุดอาจใช้งานประเภทนี้อยู่');
    }
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectStyle = {
    backgroundColor: 'var(--admin-hover)',
    border: '1px solid var(--admin-border)',
    color: 'var(--admin-fg)',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-[100]" style={{ animation: 'toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Exam Add/Edit Modal */}
      <Modal open={!!examModal} onClose={() => setExamModal(null)} title={examModal === 'edit' ? 'แก้ไขชุดข้อสอบ' : 'สร้างชุดข้อสอบใหม่'}>
        <div className="space-y-4">
          <Field label="ชื่อชุดข้อสอบ" value={examForm.title} onChange={v => setExamForm(p => ({ ...p, title: v }))} placeholder="เช่น Pre-test คณิตศาสตร์ ม.1" required />

          <Field label="วิชา" required>
            <select value={examForm.subjectId} onChange={e => setExamForm(p => ({ ...p, subjectId: e.target.value }))}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={selectStyle}>
              <option value="">-- เลือกวิชา --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <Field label="ประเภทข้อสอบ">
            <select value={examForm.examTypeId} onChange={e => setExamForm(p => ({ ...p, examTypeId: e.target.value }))}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={selectStyle}>
              <option value="">-- ไม่ระบุ --</option>
              {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>

          <Field label="เวลาในการสอบ (นาที — เว้นว่างไว้หากไม่จำกัด)" value={examForm.timeLimit}
            onChange={v => setExamForm(p => ({ ...p, timeLimit: v }))} placeholder="เช่น 60" type="number" />

          <Field label="คำอธิบาย" value={examForm.description}
            onChange={v => setExamForm(p => ({ ...p, description: v }))} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" type="textarea" />

          <div className="flex gap-3 pt-2">
            <button onClick={() => setExamModal(null)} disabled={examSaving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>
              ยกเลิก
            </button>
            <button onClick={saveExam} disabled={examSaving || !examForm.title.trim() || !examForm.subjectId}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#C5A059] hover:bg-[#b58d60] text-white flex items-center justify-center gap-2 disabled:opacity-50">
              {examSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึก
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteExamId}
        onClose={() => setDeleteExamId(null)}
        onConfirm={confirmDeleteExam}
        loading={deletingExam}
        message="การลบชุดข้อสอบจะลบโจทย์และประวัติการสอบทั้งหมดด้วย ไม่สามารถกู้คืนได้"
      />

      {/* Exam Types Management Modal */}
      <Modal open={typeModal} onClose={() => setTypeModal(false)} title="การจัดการประเภทข้อสอบ">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex. Pre-test, กลางภาค..." 
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') saveType() }}
              className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none"
              style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} 
            />
            <button onClick={saveType} disabled={!newTypeName.trim() || typeSaving}
              className="px-4 rounded-xl text-xs font-bold text-white bg-[#C5A059] shadow-md shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-colors disabled:opacity-50">
              เพิ่ม
            </button>
          </div>
          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
             {examTypes.map(t => (
                <div key={t.id} className="flex justify-between items-center px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--admin-fg)' }}>{t.name}</span>
                  <button onClick={() => deleteType(t.id)} className="p-1.5 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                     <Trash2 size={13} />
                  </button>
                </div>
             ))}
             {examTypes.length === 0 && <p className="text-xs text-center p-4 text-[var(--admin-muted)]">ยังไม่มีประเภทข้อสอบในระบบ</p>}
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: mounted ? 'card-enter 0.4s ease both' : 'none' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/e-learning" className="flex items-center gap-1 text-xs font-semibold hover:text-[#C5A059] transition-colors" style={{ color: 'var(--admin-muted)' }}>
              <ChevronLeft size={14} /> E-Learning
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-fg)' }}>
            คลังข้อสอบ (Exams)
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>จัดการชุดข้อสอบ, ตั้งเวลา และผูกข้อสอบกับวิชา</p>
        </div>
        <button
          onClick={openAddExam}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#C5A059] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all"
        >
          <Plus size={16} /> สร้างชุดข้อสอบใหม่
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl p-4 flex gap-4" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', animation: mounted ? 'card-enter 0.5s ease both' : 'none' }}>
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}>
          <Search size={16} style={{ color: 'var(--admin-muted)' }} />
          <input type="text" placeholder="ค้นหาชื่อข้อสอบ, วิชา..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--admin-fg)' }} />
        </div>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-muted)' }}>
            <X size={16} />
          </button>
        )}
        <button onClick={() => setTypeModal(true)} className="px-4 flex items-center gap-2 rounded-xl text-xs font-bold transition-colors border" style={{ backgroundColor: 'var(--admin-hover)', borderColor: 'var(--admin-border)', color: 'var(--admin-fg)' }}>
           <Tag size={14}/> ตั้งค่าประเภท
        </button>
      </div>

      {/* Exam hints */}
      {subjects.length === 0 && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400">
          <Info size={18} className="shrink-0" />
          <p className="text-sm font-semibold">ยังไม่มีรายวิชา — <Link href="/admin/e-learning" className="underline">สร้างระดับชั้นและวิชาก่อน</Link> แล้วค่อยสร้างข้อสอบ</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-[#C5A059] w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam, i) => (
            <div key={exam.id} className="rounded-2xl p-5 border group hover:shadow-lg transition-all"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)', animation: mounted ? `card-enter 0.5s ease ${i * 50}ms both` : 'none' }}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs px-2 py-1 rounded-md font-bold" style={{ backgroundColor: 'var(--admin-hover)', color: '#C5A059' }}>
                  {exam.subject.name}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditExam(exam)}
                    className="p-1 hover:bg-blue-500/10 text-blue-400 rounded-md transition-colors"
                    title="แก้ไข"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteExamId(exam.id)}
                    className="p-1 hover:bg-red-500/10 text-red-400 rounded-md transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base mb-1 line-clamp-2" style={{ color: 'var(--admin-fg)' }}>{exam.title}</h3>

              {exam.examType && (
                <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--admin-muted)' }}>
                  <Tag size={11} /> {exam.examType.name}
                </p>
              )}

              <div className="flex gap-4 mb-4 text-xs font-semibold" style={{ color: 'var(--admin-fg-secondary)' }}>
                <p className="flex items-center gap-1"><Clock size={13} /> {exam.timeLimit ? `${exam.timeLimit} นาที` : 'ไม่จำกัด'}</p>
                <p>{exam._count?.questions || 0} ข้อ</p>
                <p>{exam._count?.attempts || 0} คนสอบ</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                <Link
                  href={`/admin/exams/${exam.id}/answer-key`}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20"
                >
                  ดูเฉลย / จัดการโจทย์
                </Link>
              </div>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="col-span-full text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: 'var(--admin-border)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--admin-fg)' }}>
                {searchQuery ? 'ไม่พบข้อสอบที่ตรงกับคำค้นหา' : 'ยังไม่มีชุดข้อสอบในระบบ'}
              </p>
              {!searchQuery && (
                <button onClick={openAddExam} className="mt-2 text-sm font-semibold text-[#C5A059] hover:underline">
                  + สร้างชุดข้อสอบแรก
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes card-enter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
