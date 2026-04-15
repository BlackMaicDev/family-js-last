'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Loader2, Trophy, ArrowRight, Target, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ResultData {
   id: string;
   score: number;
   totalScore: number;
   exam: { title: string; timeLimit: number; subject: { name: string } };
   startTime: string;
   endTime: string;
}

export default function ExamResultPage() {
   const { examId } = useParams() as { examId: string };
   const searchParams = useSearchParams();
   const attemptId = searchParams.get('attemptId');
   const router = useRouter();

   const [result, setResult] = useState<ResultData | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!attemptId) {
         router.push(`/exams/${examId}`);
         return;
      }
      fetchResult();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [attemptId, examId]);

   const fetchResult = async () => {
      try {
         const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
         const res = await fetch(`${apiUrl}/e-learning/attempts/${attemptId}/result`, { credentials: 'include' });
         if (res.ok) setResult(await res.json());
      } finally {
         setLoading(false);
      }
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center p-20 dark:bg-[#0f1115]"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;
   if (!result) return <div className="p-20 text-center">ไม่พบผลการสอบ</div>;

   const percentage = Math.round((result.score / result.totalScore) * 100) || 0;

   let gradeText = 'พยายามอีกครั้งนะ!';
   let gradeColor = 'text-amber-500';
   let gradeBg = 'bg-amber-500/10 border-amber-500/20';

   if (percentage >= 80) {
      gradeText = 'ยอดเยี่ยมมาก! 🏆';
      gradeColor = 'text-emerald-500';
      gradeBg = 'bg-emerald-500/10 border-emerald-500/20';
   } else if (percentage >= 50) {
      gradeText = 'ผ่านเกณฑ์! 👍';
      gradeColor = 'text-blue-500';
      gradeBg = 'bg-blue-500/10 border-blue-500/20';
   }

   const duration = Math.round((new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 60000);

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-24 pt-12">
         <div className="max-w-2xl mx-auto px-6">

            <div className="text-center mb-10 animate-fade-in-up">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 text-indigo-500 mb-6 shadow-xl shadow-indigo-500/20 mix-blend-multiply dark:mix-blend-normal">
                  <Trophy size={40} />
               </div>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">สรุปผลการทำแบบทดสอบ</h1>
               <p className="text-slate-500 font-semibold">{result.exam.title}</p>
            </div>

            <div className="bg-white dark:bg-[#1a1d24] rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden animate-fade-in-up">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

               <div className={`inline-block px-5 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-widest mb-8 ${gradeColor} ${gradeBg}`}>
                  {gradeText}
               </div>

               <div className="flex justify-center items-end gap-3 mb-2">
                  <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                     {result.score}
                  </span>
                  <span className="text-4xl font-bold text-slate-300 dark:text-slate-600 pb-2">/</span>
                  <span className="text-4xl font-bold text-slate-400 dark:text-slate-500 pb-2">
                     {result.totalScore}
                  </span>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-4">คิดเป็น {percentage}% ของคะแนนเต็ม</p>

               <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
                     <Target size={24} className="text-blue-500 mb-2" />
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">ความแม่นยำ</span>
                     <span className="text-lg font-black text-slate-700 dark:text-slate-200">{percentage}%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
                     <Clock size={24} className="text-amber-500 mb-2" />
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">เวลาที่ใช้ไป</span>
                     <span className="text-lg font-black text-slate-700 dark:text-slate-200">{duration || '< 1'} นาที</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up">
               <Link href="/exams" className="flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all">
                  กลับไปที่คลังข้อสอบ
               </Link>
               <Link href={`/exams/${examId}`} className="flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-all">
                  <RefreshCw size={18} /> ทำข้อสอบอีกครั้ง
               </Link>
            </div>
         </div>

         <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      </div>
   );
}
