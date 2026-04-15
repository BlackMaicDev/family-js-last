'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit3, Loader2, PlayCircle, 
  Save, X, AlertTriangle, ChevronLeft, Video, 
  FileText, ArrowUp, ArrowDown 
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
  gradeLevel?: { name: string };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
}

// ─── Modal ───
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

// ── Confirm Delete Modal ──
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

// ── Input Field ──
function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={5}
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none"
          style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
          style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }} />
      )}
    </div>
  );
}

export default function AdminLessonsPage() {
  const { subjectId } = useParams() as { subjectId: string };
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ title: '', videoUrl: '', content: '', order: 0 });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subRes = await fetch(`${apiUrl}/e-learning/subjects/${subjectId}`, { credentials: 'include' });

      if (!subRes.ok) throw new Error('Failed to fetch subject');
      const subData = await subRes.json();
      setSubject(subData);
      setLessons(subData.lessons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setModalType('add');
    setForm({ title: '', videoUrl: '', content: '', order: lessons.length });
    setIsModalOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setModalType('edit');
    setEditingLessonId(lesson.id);
    setForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl || '',
      content: lesson.content,
      order: lesson.order
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setIsSaving(true);
    try {
      const url = modalType === 'add' 
        ? `${apiUrl}/e-learning/lessons` 
        : `${apiUrl}/e-learning/lessons/${editingLessonId}`;
      
      const res = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          subjectId,
          order: Number(form.order)
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/lessons/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const moveOrder = async (lesson: Lesson, direction: 'up' | 'down') => {
    const idx = lessons.findIndex(l => l.id === lesson.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === lessons.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const targetLesson = lessons[targetIdx];

    try {
      await Promise.all([
        fetch(`${apiUrl}/e-learning/lessons/${lesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: targetLesson.order }),
        }),
        fetch(`${apiUrl}/e-learning/lessons/${targetLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: lesson.order }),
        })
      ]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !subject) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin text-[#C5A059] mb-4" />
      <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>กำลังโหลดข้อมูลบทเรียน...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/e-learning" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-fg)' }}>จัดการบทเรียน</h1>
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
              {subject?.gradeLevel?.name} - {subject?.name}
            </p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-white rounded-xl font-bold shadow-lg shadow-[#C5A059]/20 hover:bg-[#b58d60] transition-all">
          <Plus size={18} /> เพิ่มบทเรียนใหม่
        </button>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.length > 0 ? (
          lessons.map((lesson, i) => (
            <div key={lesson.id} className="p-5 rounded-2xl flex items-center justify-between gap-4 group" 
                 style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] border border-[#C5A059]/20 font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate" style={{ color: 'var(--admin-fg)' }}>{lesson.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--admin-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Video size={12} className={lesson.videoUrl ? 'text-emerald-400' : ''} /> {lesson.videoUrl ? 'มีวิดีโอ' : 'ไม่มีวิดีโอ'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-blue-400" /> เนื้อหา {lesson.content.length} ตัวอักษร
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveOrder(lesson, 'up')} className="p-1 rounded hover:bg-white/10 text-stone-400 disabled:opacity-30" disabled={i === 0}>
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveOrder(lesson, 'down')} className="p-1 rounded hover:bg-white/10 text-stone-400 disabled:opacity-30" disabled={i === lessons.length - 1}>
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button onClick={() => openEdit(lesson)} className="p-2.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors" title="แก้ไข">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => setDeleteId(lesson.id)} className="p-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="ลบ">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--admin-border)' }}>
            <PlayCircle size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--admin-fg)' }} />
            <h3 className="font-bold text-lg" style={{ color: 'var(--admin-fg)' }}>ยังไม่มีบทเรียน</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>เริ่มเพิ่มบทเรียนแรกเพื่อให้นักเรียนเข้าศึกษาเนื้อหา</p>
            <button onClick={openAdd} className="mt-6 text-[#C5A059] font-bold hover:underline">เพิ่มบทเรียนแรกเลย</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'add' ? 'เพิ่มบทเรียนใหม่' : 'แก้ไขบทเรียน'}>
        <div className="space-y-4">
          <Field label="ชื่อบทเรียน" value={form.title} onChange={v => setForm(p => ({...p, title: v}))} placeholder="เช่น บทนำเกี่ยวกับฟิสิกส์" required />
          <Field label="Video URL (YouTube)" value={form.videoUrl} onChange={v => setForm(p => ({...p, videoUrl: v}))} placeholder="https://www.youtube.com/watch?v=..." />
          <Field label="ลำดับบทเรียน" value={String(form.order)} onChange={v => setForm(p => ({...p, order: Number(v)}))} />
          <Field label="เนื้อหาบทเรียน (สรุป/เนื้อหาหลัก)" type="textarea" value={form.content} onChange={v => setForm(p => ({...p, content: v}))} placeholder="ระบุเนื้อหาบทเรียนที่นี่..." />
          
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold" style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>ยกเลิก</button>
            <button onClick={handleSave} disabled={isSaving || !form.title} className="flex-1 py-2.5 rounded-xl bg-[#C5A059] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#b58d60] transition-all disabled:opacity-50">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} บันทึก
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        loading={isDeleting} 
        message="คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้? ข้อมูลเนื้อหาจะหายไปอย่างถาวร" 
      />
    </div>
  );
}
