'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Book, PlayCircle } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string | null;
  _count: { lessons: number; exams: number };
}

interface Grade {
  id: string;
  name: string;
  description: string | null;
  subjects: Subject[];
}

export default function GradeSubjectsPage() {
  const { gradeId } = useParams() as { gradeId: string };
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradeDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeId]);

  const fetchGradeDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/e-learning/grades/${gradeId}`);
      if (res.ok) setGrade(await res.json());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center pt-32 dark:bg-[#0f1115]"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  if (!grade) return <div className="min-h-screen pt-32 text-center dark:bg-[#0f1115] dark:text-white">ไม่พบข้อมูลระดับชั้นนี้ หรืออาจถูกลบไปแล้ว</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        
        <Link href="/e-learning" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors mb-6">
          <ArrowLeft size={16} /> กลับไปหน้าเลือกระดับชั้น
        </Link>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">{grade.name}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-12 max-w-2xl text-lg">{grade.description || 'เลือกรายวิชาที่คุณต้องการศึกษาเพื่อเข้าถึงบทเรียนและแบบทดสอบ'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grade.subjects.map(sub => (
            <div key={sub.id} className="bg-white dark:bg-[#1a1d24] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                <Book size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{sub.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px] line-clamp-2">
                {sub.description || 'ยังไม่มีคำอธิบายสำหรับรายวิชานี้'}
              </p>
              
              <div className="flex items-center gap-3">
                <Link href={`/e-learning/subjects/${sub.id}`} className="flex-1 text-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2">
                  <PlayCircle size={16} /> เข้าสู่บทวิชา
                </Link>
              </div>
            </div>
          ))}
          {(!grade.subjects || grade.subjects.length === 0) && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-500 font-semibold">ยังไม่มีวิชาเรียนในระดับชั้นนี้</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
