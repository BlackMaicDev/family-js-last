'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Loader2, Sparkles, Target, ArrowRight } from 'lucide-react';

interface Grade {
  id: string;
  name: string;
  description: string;
  subjects: unknown[];
}

export default function StudentELearningDashboard() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/e-learning/grades`);
      if (res.ok) setGrades(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-24">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#0f1115] to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-purple-500/20 text-purple-600 dark:text-purple-300 text-sm font-semibold mb-6 animate-fade-in-up">
            <Sparkles size={16} /> พื้นที่แห่งการเรียนรู้ไร้ขีดจำกัด
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            พร้อมที่จะ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">อัปสกิล</span> ของคุณหรือยัง?
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            เลือกระดับชั้นของคุณเพื่อเข้าสู่บทเรียนสุดพรีเมียม และคลังข้อสอบที่พร้อมให้คุณฝึกฝนได้ทุกเวลา
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        {/* Feature Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16" style={{ animation: mounted ? 'fade-in-up 0.6s ease 300ms both' : 'none' }}>
          <Link href="/exams" className="group p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
            <Target size={48} className="mb-6 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all" />
            <h2 className="text-3xl font-bold mb-2">คลังข้อสอบ (Question Bank)</h2>
            <p className="text-blue-100 mb-8 max-w-sm">เจาะลึกทุกข้อสอบ ทลายทุกมิติการสอบเข้า พร้อมระบบจับเวลาและวิเคราะห์ผล</p>
            <div className="inline-flex items-center gap-2 font-semibold bg-white/20 rounded-xl px-5 py-2.5 backdrop-blur-md group-hover:bg-white border border-white/30 group-hover:text-indigo-700 transition-colors">
              ฝึกทำข้อสอบเลย <ArrowRight size={18} />
            </div>
          </Link>

          <div className="group p-8 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white overflow-hidden relative shadow-xl border border-slate-800 dark:border-slate-700 flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-bold mb-3">ก้าวสู่ความสำเร็จอย่างมั่นใจ</h3>
            <p className="text-slate-400">เนื้อหาครบถ้วน คลอบคลุมทุกการสอบของยุคนี้</p>
          </div>
        </div>

        {/* Grade Levels Section */}
        <div className="flex items-center gap-3 mb-8" style={{ animation: mounted ? 'fade-in-up 0.6s ease 400ms both' : 'none' }}>
          <GraduationCap size={28} className="text-purple-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">เลือกระดับชั้นเรียน (Grades)</h2>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {grades.map((grade, i) => (
              <Link 
                key={grade.id} 
                href={`/e-learning/${grade.id}`}
                className="group p-6 rounded-3xl bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-300"
                style={{ animation: mounted ? `fade-in-up 0.6s ease ${500 + i * 100}ms both` : 'none' }}
              >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-colors mb-5">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{grade.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{grade.description || 'สำรวจรายวิชาและหลักสูตร'}</p>
            <div className="mt-6 flex justify-between items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
              <span>{grade.subjects?.length || 0} รายวิชา</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
