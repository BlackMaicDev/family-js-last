'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, ArrowLeft, BookOpen, PlayCircle, 
  Target, ChevronRight, Clock, Star, Sparkles 
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  order: number;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  examType?: { name: string };
  _count: { questions: number };
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevel: { id: string, name: string };
  lessons: Lesson[];
  exams: Exam[];
}

export default function SubjectDetailPage() {
  const { subjectId } = useParams() as { subjectId: string };
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectDetails();
  }, [subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/e-learning/subjects/${subjectId}`);
      if (res.ok) setSubject(await res.json());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center pt-32 dark:bg-[#0f1115]"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  if (!subject) return <div className="min-h-screen pt-32 text-center dark:bg-[#0f1115] dark:text-white">ไม่พบข้อมูลรายวิชานี้</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        
        <Link href={`/e-learning/${subject.gradeLevel.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors mb-6">
          <ArrowLeft size={16} /> กลับไปหน้าเลือกรายวิชา ({subject.gradeLevel.name})
        </Link>

        {/* Hero Section Card */}
        <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-4">
                    <Sparkles size={14} /> Subject Hub
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                    {subject.name}
                    {subject.code && <span className="ml-3 text-xl md:text-2xl font-medium text-slate-400">({subject.code})</span>}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed">
                    {subject.description || 'ยินดีต้อนรับสู่ศูนย์รวมการเรียนรู้ของวิชานี้ คุณสามารถเลือกศึกษาบทเรียนหรือเริ่มทำข้อสอบได้จากข้างล่างนี้'}
                </p>

                <div className="flex gap-6 mt-8">
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{subject.lessons.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">บทเรียน</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{subject.exams.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชุดข้อสอบ</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Lessons Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">เนื้อหาบทเรียน (Lessons)</h2>
                </div>

                {subject.lessons.length > 0 ? (
                    <div className="space-y-4">
                        {subject.lessons.map((lesson, i) => (
                            <Link 
                                key={lesson.id} 
                                href={`/e-learning/lessons/${lesson.id}`}
                                className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {lesson.title}
                                        </h3>
                                        {lesson.videoUrl && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase mt-0.5">
                                                <PlayCircle size={10} /> Video included
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 font-medium">ยังไม่มีบทเรียนในวิชานี้</p>
                    </div>
                )}
            </div>

            {/* Exams Column */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                        <Target size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ข้อสอบ (Exams)</h2>
                </div>

                {subject.exams.length > 0 ? (
                    <div className="space-y-4">
                        {subject.exams.map(exam => (
                            <Link 
                                key={exam.id}
                                href={`/exams/${exam.id}`}
                                className="block p-6 rounded-3xl bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-500/50 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                                        {exam.examType?.name || 'General Exam'}
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Target size={20} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500" /> {exam._count.questions} ข้อ</span>
                                    {exam.timeLimit && (
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.timeLimit} นาที</span>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                    ทำข้อสอบเลย
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 font-medium">ยังไม่มีข้อสอบในขณะนี้</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}
