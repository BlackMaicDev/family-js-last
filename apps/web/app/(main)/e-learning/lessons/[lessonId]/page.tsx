'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, ArrowLeft, PlayCircle, 
  ChevronLeft, ChevronRight, BookOpen, 
  Share2, Info 
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
  subjectId: string;
  subject: {
    name: string;
    lessons: { id: string, title: string, order: number }[];
  }
}

export default function LessonViewerPage() {
  const { lessonId } = useParams() as { lessonId: string };
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const fetchLessonDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/e-learning/lessons/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div className="min-h-screen flex justify-center pt-32 dark:bg-[#0f1115]"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  if (!lesson) return <div className="min-h-screen pt-32 text-center dark:bg-[#0f1115] dark:text-white">ไม่พบข้อมูลบทเรียนนี้</div>;

  const sortedLessons = [...(lesson.subject?.lessons || [])].sort((a,b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const youtubeId = lesson.videoUrl ? getYouTubeId(lesson.videoUrl) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1115] pb-24">
      {/* Top Navbar for Viewer */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/e-learning/subjects/${lesson.subjectId}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold hidden md:block">ออกจากการเรียน</span>
          </Link>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">{lesson.subject.name}</span>
            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white max-w-[200px] md:max-w-md truncate">{lesson.title}</span>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors hidden sm:block"><Share2 size={18} /></button>
             <button className="p-2 text-slate-400 hover:text-yellow-500 transition-colors hidden sm:block"><Info size={18} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-8 px-6">
        
        {/* Video Player Section */}
        {youtubeId ? (
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black mb-10 ring-1 ring-white/10">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : lesson.videoUrl ? (
            <div className="py-12 bg-slate-100 dark:bg-slate-800/50 rounded-3xl text-center mb-10 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 font-medium">ไม่สามารถแสดงวิดีโอจากลิงก์สถาบันนี้ได้โดยตรง</p>
                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-blue-500 font-bold hover:underline">
                    คลิกเพื่อเปิดดูวิดีโอภายนอก <PlayCircle size={16} />
                </a>
            </div>
        ) : null}

        {/* Content Section */}
        <div className="max-w-none">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                    <BookOpen size={18} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white m-0">สรุปเนื้อหาบทเรียน</h2>
            </div>
            
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-lg bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                {lesson.content || 'ไม่มีเนื้อหาตัวอักษรสำหรับบทเรียนนี้'}
            </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-auto">
                {prevLesson && (
                    <Link href={`/e-learning/lessons/${prevLesson.id}`} className="flex flex-col items-start gap-1 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                            <ChevronLeft size={12} /> บทก่อนหน้า
                        </span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{prevLesson.title}</span>
                    </Link>
                )}
            </div>

            <div className="w-full sm:w-auto text-right">
                {nextLesson && (
                    <Link href={`/e-learning/lessons/${nextLesson.id}`} className="flex flex-col items-end gap-1 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                        <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            บทถัดไป <ChevronRight size={12} />
                        </span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{nextLesson.title}</span>
                    </Link>
                )}
            </div>
        </div>

        {/* Suggestion Section */}
        <div className="mt-20 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden shadow-xl shadow-purple-500/20">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-extrabold mb-2 text-white">เรียนจบบทนี้แล้ว?</h3>
                    <p className="text-indigo-100 text-sm">ลองทดสอบความรู้ด้วยคลังข้อสอบในวิชานี้เพื่อวัดผลการเรียนกันเถอะ!</p>
                </div>
                <Link href={`/e-learning/subjects/${lesson.subjectId}`} className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-xl shadow-black/10 hover:scale-105 transition-transform">
                    ไปที่คลังข้อสอบเลย
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
