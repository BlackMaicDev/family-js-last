'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Clock, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

interface Option { id: string; text: string; }
interface Question { id: string; text: string; imageUrl?: string; options: Option[]; }
interface Exam { id: string; title: string; timeLimit: number | null; questions: Question[]; }

export default function TakeExamPage() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const startAttempt = useCallback(async () => {
    try {
      setLoading(true);
      // Create attempt
      const startRes = await fetch(`${apiUrl}/e-learning/exams/${examId}/start`, { method: 'POST', credentials: 'include' });
      if (!startRes.ok) throw new Error('เริ่มทำข้อสอบไม่สำเร็จ หรือคุณเข้าสู่ระบบไม่สมบูรณ์');
      const startData = await startRes.json();
      setAttemptId(startData.id);

      // Fetch exam details via Admin-like endpoint for now, or a specific student endpoint 
      // Actually /exams/:id is public in our controller demo!
      const examRes = await fetch(`${apiUrl}/e-learning/exams/${examId}`, { credentials: 'include' });
      if (!examRes.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
      const examData = await examRes.json();
      setExam(examData);

      if (examData.timeLimit) {
        setTimeLeft(examData.timeLimit * 60);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อสอบ');
    } finally {
      setLoading(false);
    }
  }, [examId, apiUrl]);

  useEffect(() => {
    startAttempt();
  }, [startAttempt]);

  const submitExam = useCallback(async () => {
    if (!attemptId) return;
    try {
      setSubmitting(true);
      const payload = Object.entries(answers).map(([qId, oId]) => ({ questionId: qId, selectedOptionId: oId }));
      const res = await fetch(`${apiUrl}/e-learning/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: payload })
      });
      if (!res.ok) throw new Error('ส่งกระดาษคำตอบไม่สำเร็จ');
      
      router.push(`/exams/${examId}/result?attemptId=${attemptId}`);
    } catch (err: unknown) {
       alert(err instanceof Error ? err.message : 'ไม่สามารถส่งข้อสอบได้');
       setSubmitting(false);
    }
  }, [attemptId, answers, apiUrl, examId, router]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // Auto submit
      submitExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitExam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (qId: string, oId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center p-20 dark:bg-[#0f1115]"><Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4"/>กำลังเตรียมข้อสอบ...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-20 dark:bg-[#0f1115]"><XCircle className="text-red-500 w-16 h-16 mb-4"/><div className="text-xl font-bold dark:text-white">{error}</div></div>;
  if (!exam) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-32">
       {/* Sticky Header with Timer */}
       <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
             <div>
                <h1 className="font-bold text-slate-900 dark:text-white md:text-lg line-clamp-1">{exam.title}</h1>
                <p className="text-xs text-slate-500 font-semibold">{Object.keys(answers).length} / {exam.questions.length} ข้อที่ทำแล้ว</p>
             </div>
             {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg tabular-nums transition-colors ${timeLeft < 60 ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                   <Clock size={20} className={timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}/>
                   {formatTime(timeLeft)}
                </div>
             )}
          </div>
       </div>

       <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
          {exam.questions.map((q, idx) => (
             <div key={q.id} className="bg-white dark:bg-[#1a1d24] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800/50">
                <div className="flex gap-4">
                   <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-lg">
                      {idx + 1}
                   </div>
                   <div className="flex-1 mt-1.5">
                      <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6 whitespace-pre-wrap">{q.text}</p>
                      
                      {q.imageUrl && (
                        <div className="mb-6">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={q.imageUrl} alt="Question Image" className="max-w-full max-h-80 rounded-2xl border border-slate-200 dark:border-slate-800 object-contain" />
                        </div>
                      )}

                      <div className="space-y-3">
                         {q.options.map(opt => {
                            const isSelected = answers[q.id] === opt.id;
                            return (
                               <button 
                                  key={opt.id}
                                  onClick={() => handleSelectOption(q.id, opt.id)}
                                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500' : 'border-slate-100 dark:border-slate-800 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                               >
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                     {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                  </div>
                                  <span className={`text-[15px] font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                     {opt.text}
                                  </span>
                               </button>
                            );
                         })}
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Floating Action Bar */}
       <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-50 dark:from-[#0f1115] to-transparent pointer-events-none z-40">
          <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
             <button
                onClick={submitExam}
                disabled={submitting}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 flex items-center gap-2 transform transition hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
             >
                {submitting ? <Loader2 className="animate-spin w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                ส่งกระดาษคำตอบ
             </button>
          </div>
       </div>

    </div>
  );
}
