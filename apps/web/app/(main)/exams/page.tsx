'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Clock, Target, CheckCircle2, Filter } from 'lucide-react';

interface Exam { id: string; title: string; timeLimit: number | null; examType: { name: string } | null; subject: { name: string }; _count: { questions: number; attempts: number }; }

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/e-learning/exams`);
      if (res.ok) setExams(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filtered = exams.filter(e => e.title.includes(search) || e.subject.name.includes(search) || (e.examType?.name && e.examType.name.includes(search)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pt-24 pb-12 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-md border border-white/20">
               <Target size={14}/> สนามสอบจำลอง
             </div>
             <h1 className="text-3xl md:text-5xl font-black mb-3">คลังข้อสอบ (Question Bank)</h1>
             <p className="text-blue-100">ฝึกทำข้อสอบเสมือนจริง วิเคราะห์จุดอ่อน พัฒนาจุดแข็ง</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
         <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-white dark:bg-[#1a1d24] rounded-2xl p-2 flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <Search className="text-slate-400 ml-3"/>
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="ค้นหาวิชา, ชื่อข้อสอบ หรือประเภท (เช่น A-Level, TGAT)..."
                  className="bg-transparent border-none outline-none w-full py-2 text-slate-700 dark:text-slate-200"
                />
            </div>
            <button className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-2 font-semibold shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
               <Filter size={18}/> ตัวกรอง
            </button>
         </div>

         {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filtered.map((exam, i) => (
                  <Link 
                     key={exam.id} 
                     href={"/exams/" + exam.id}
                     className="group bg-white dark:bg-[#1a1d24] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                     style={{ animation: mounted ? 'fade-in-up 0.5s ease ' + (i * 50) + 'ms both' : 'none' }}
                  >
                     <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                           {exam.subject.name}
                        </span>
                        {exam.examType && (
                           <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-500">
                              {exam.examType.name}
                           </span>
                        )}
                     </div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {exam.title}
                     </h2>
                     <div className="mt-auto pt-6 grid grid-cols-2 gap-3 pb-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                           <Clock size={16} className="text-amber-500"/>
                           {exam.timeLimit ? `${exam.timeLimit} นาที` : 'ไม่จำกัด'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                           <CheckCircle2 size={16} className="text-emerald-500"/>
                           {exam._count?.questions || 0} ข้อ
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        เริ่มทำข้อสอบ
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                     </div>
                  </Link>
               ))}
               {filtered.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-500 font-semibold mb-2">ไม่พบข้อสอบที่ตรงกับคำค้นหา</p>
                    <p className="text-sm text-slate-400">ลองเปลี่ยนคำค้นหาด้านบนดูอีกครั้ง</p>
                 </div>
               )}
            </div>
         )}
      </div>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
