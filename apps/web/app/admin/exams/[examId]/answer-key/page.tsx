'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle2, FileText, Plus, Trash2, X, Save, AlertTriangle, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface Option { id: string; text: string; isCorrect: boolean; }
interface Question { id: string; text: string; imageUrl: string | null; explanation: string | null; options: Option[]; order: number; }
interface Exam { id: string; title: string; timeLimit: number | null; questions: Question[]; }

// ─── Modal ────────────────────────────────────────────────────
function Modal({ open, onClose, title, wide, children }: {
  open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div ref={ref} tabIndex={-1}
        className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl shadow-2xl outline-none max-h-[90vh] overflow-y-auto`}
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        onClick={e => e.stopPropagation()}>
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
        style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        onClick={e => e.stopPropagation()}>
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

// ─── Option Row ───────────────────────────────────────────────
interface OptionDraft { text: string; isCorrect: boolean; }

function OptionRow({ opt, index, onChange, onRemove, onSetCorrect }: {
  opt: OptionDraft; index: number; onChange: (text: string) => void;
  onRemove: () => void; onSetCorrect: () => void;
}) {
  const letters = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ'];
  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${opt.isCorrect ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-transparent'}`}
      style={{ backgroundColor: opt.isCorrect ? undefined : 'var(--admin-hover)' }}>
      <button
        type="button" onClick={onSetCorrect}
        className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--admin-border)] text-[var(--admin-muted)]'}`}
        title="ตั้งเป็นคำตอบที่ถูกต้อง"
      >
        {opt.isCorrect ? <CheckCircle2 size={14} /> : letters[index] || index + 1}
      </button>
      <input
        type="text" value={opt.text} onChange={e => onChange(e.target.value)}
        placeholder={`ตัวเลือกที่ ${index + 1}`}
        className="flex-1 text-sm bg-transparent outline-none" style={{ color: 'var(--admin-fg)' }}
      />
      <button type="button" onClick={onRemove} className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminAnswerKeyPage() {
  const { examId } = useParams() as { examId: string };
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Question Modal
  const [qModal, setQModal] = useState<'add' | 'edit' | null>(null);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [qText, setQText] = useState('');
  const [qImageUrl, setQImageUrl] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [qSaving, setQSaving] = useState(false);

  // ── Delete Question
  const [deleteQId, setDeleteQId] = useState<string | null>(null);
  const [deletingQ, setDeletingQ] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => { fetchExam(); }, [examId]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/exams/${examId}`, { credentials: 'include' });
      if (res.ok) setExam(await res.json());
    } finally {
      setLoading(false);
    }
  };

  // ── Open Add Question Modal
  const openAddQuestion = () => {
    setQText('');
    setQImageUrl('');
    setQExplanation('');
    setOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setEditingQ(null);
    setQModal('add');
  };

  // ── Open Edit Question Modal
  const openEditQuestion = (q: Question) => {
    setQText(q.text);
    setQImageUrl(q.imageUrl || '');
    setQExplanation(q.explanation || '');
    setOptions(q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
    setEditingQ(q);
    setQModal('edit');
  };

  const setOptionCorrect = (idx: number) => {
    setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  };

  const updateOptionText = (idx: number, text: string) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, text } : o));
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions(prev => [...prev, { text: '', isCorrect: false }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // ensure at least one correct
      if (!next.some(o => o.isCorrect)) next[0].isCorrect = true;
      return next;
    });
  };

  const saveQuestion = async () => {
    const validOpts = options.filter(o => o.text.trim());
    if (!qText.trim() || validOpts.length < 2 || !validOpts.some(o => o.isCorrect)) return;
    setQSaving(true);
    try {
      const isEdit = qModal === 'edit' && editingQ;
      const url = isEdit
        ? `${apiUrl}/e-learning/questions/${editingQ.id}`
        : `${apiUrl}/e-learning/questions`;
      const body = {
        data: {
          text: qText.trim(),
          imageUrl: qImageUrl.trim() || undefined,
          explanation: qExplanation.trim() || undefined,
          order: isEdit ? editingQ.order : (exam?.questions.length || 0) + 1,
          examId,
        },
        options: validOpts.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      };
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('บันทึกโจทย์ไม่สำเร็จ');
      setQModal(null);
      showSuccess(isEdit ? 'แก้ไขโจทย์สำเร็จ' : 'เพิ่มโจทย์สำเร็จ');
      await fetchExam();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setQSaving(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteQId) return;
    setDeletingQ(true);
    try {
      const res = await fetch(`${apiUrl}/e-learning/questions/${deleteQId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('ลบโจทย์ไม่สำเร็จ');
      setDeleteQId(null);
      showSuccess('ลบโจทย์สำเร็จ');
      await fetchExam();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setDeletingQ(false);
    }
  };

  const canSave = qText.trim() && options.filter(o => o.text.trim()).length >= 2 && options.some(o => o.isCorrect && o.text.trim());

  if (loading) return (
    <div className="flex justify-center p-32">
      <Loader2 className="animate-spin text-[#C5A059] w-8 h-8" />
    </div>
  );
  if (!exam) return (
    <div className="p-10 text-center" style={{ color: 'var(--admin-muted)' }}>ไม่พบข้อมูลข้อสอบ</div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-[100]" style={{ animation: 'toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      <Modal open={!!qModal} onClose={() => setQModal(null)} title={qModal === 'edit' ? 'แก้ไขโจทย์' : 'เพิ่มโจทย์ใหม่'} wide>
        <div className="space-y-5">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>
              โจทย์ข้อสอบ <span className="text-red-400">*</span>
            </label>
            <textarea
              value={qText} onChange={e => setQText(e.target.value)}
              placeholder="พิมพ์โจทย์ข้อสอบที่นี่..."
              rows={4}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none leading-relaxed"
              style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
            />
          </div>

          {/* Question Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>ลิงก์รูปภาพประกอบโจทย์ (Image URL - ไม่บังคับ)</label>
            <input type="text" value={qImageUrl} onChange={e => setQImageUrl(e.target.value)}
              placeholder="เช่น https://example.com/math.jpg"
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none"
              style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
            />
            {qImageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border p-2" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qImageUrl} alt="Preview" className="max-h-40 object-contain w-full rounded-lg" onError={e => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>
                ตัวเลือก (คลิก ● เพื่อตั้งเป็นคำตอบที่ถูกต้อง) <span className="text-red-400">*</span>
              </label>
              {options.length < 6 && (
                <button onClick={addOption} className="text-[11px] font-bold text-[#C5A059] hover:underline flex items-center gap-1">
                  <Plus size={12} /> เพิ่มตัวเลือก
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <OptionRow key={i} opt={opt} index={i}
                  onChange={text => updateOptionText(i, text)}
                  onRemove={() => removeOption(i)}
                  onSetCorrect={() => setOptionCorrect(i)}
                />
              ))}
            </div>
            <p className="text-[11px]" style={{ color: 'var(--admin-muted)' }}>
              ✓ ตัวเลือกสีเขียว = คำตอบที่ถูก | ต้องมีอย่างน้อย 2 ตัวเลือก
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--admin-muted)' }}>คำอธิบายเฉลย / วิธีทำ (ไม่บังคับ)</label>
            <textarea value={qExplanation} onChange={e => setQExplanation(e.target.value)}
              placeholder="อธิบายวิธีคิดหรือเหตุผล..."
              rows={3}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none"
              style={{ backgroundColor: 'var(--admin-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-fg)' }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setQModal(null)} disabled={qSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'var(--admin-hover)', color: 'var(--admin-fg)' }}>ยกเลิก</button>
            <button onClick={saveQuestion} disabled={qSaving || !canSave}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#C5A059] hover:bg-[#b58d60] text-white flex items-center justify-center gap-2 disabled:opacity-50">
              {qSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึกโจทย์
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteQId}
        onClose={() => setDeleteQId(null)}
        onConfirm={confirmDeleteQuestion}
        loading={deletingQ}
        message="การลบโจทย์ข้อนี้จะลบตัวเลือกและคำตอบที่บันทึกไว้ด้วย"
      />

      {/* Back Link */}
      <Link href="/admin/exams" className="inline-flex items-center gap-2 text-sm hover:text-[#C5A059] transition-colors" style={{ color: 'var(--admin-muted)' }}>
        <ArrowLeft size={16} /> กลับไปคลังข้อสอบ
      </Link>

      {/* Header */}
      <div className="flex justify-between items-end border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-fg)' }}>เฉลย: {exam.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
            {exam.questions.length} ข้อ · {exam.timeLimit ? `${exam.timeLimit} นาที` : 'ไม่จำกัดเวลา'}
          </p>
        </div>
        <button
          onClick={openAddQuestion}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] hover:bg-[#b58d60] rounded-xl text-xs font-bold text-white shadow-md shadow-[#C5A059]/20 transition-all"
        >
          <Plus size={14} /> เพิ่มโจทย์ใหม่
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="p-6 rounded-2xl border group" style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 flex-shrink-0 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--admin-fg)' }}>
                  {q.text}
                </p>
                {q.imageUrl && (
                  <div className="mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={q.imageUrl} alt="Question Image" className="max-h-64 rounded-xl border object-contain bg-black/10" style={{ borderColor: 'var(--admin-border)' }} />
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEditQuestion(q)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors" title="แก้ไขโจทย์">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => setDeleteQId(q.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="ลบโจทย์">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {q.options.map(opt => (
                <div key={opt.id} className={`p-3 rounded-xl border flex justify-between items-center ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-[var(--admin-hover)] border-transparent'}`}>
                  <span className={`text-sm ${opt.isCorrect ? 'text-emerald-400 font-bold' : ''}`} style={opt.isCorrect ? {} : { color: 'var(--admin-fg-secondary)' }}>
                    {opt.text}
                  </span>
                  {opt.isCorrect && <CheckCircle2 size={15} className="text-emerald-500 shrink-0 ml-2" />}
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className="ml-11 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs mb-1.5 uppercase tracking-wide">
                  <FileText size={13} /> คำอธิบายเฉลย / วิธีทำ
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--admin-fg-secondary)' }}>{q.explanation}</p>
              </div>
            )}
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-dashed" style={{ borderColor: 'var(--admin-border)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--admin-fg)' }}>ยังไม่มีโจทย์ในข้อสอบชุดนี้</p>
            <button onClick={openAddQuestion} className="text-sm font-semibold text-[#C5A059] hover:underline">
              + เพิ่มโจทย์ข้อแรก
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
