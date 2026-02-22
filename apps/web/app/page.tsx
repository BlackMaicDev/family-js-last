'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Dumbbell, Star, ChevronRight, Terminal, Clock, Loader2, LayoutGrid, Sparkles } from 'lucide-react';
import axios from 'axios';
import { getFullUrl } from './lib/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

import PostCard from '@/app/components/PostCard';

// --- 2. HOME CONTENT LOGIC ---
const HomeContent = () => {
  const searchParams = useSearchParams();
  const queryText = (searchParams.get('q') || '').toLowerCase();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // API Base URL (adjust this to match your NestJS API port)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch Categories & Posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลหมวดหมู่
        const catRes = await axios.get(`${API_URL}/categories`);
        setCategories(catRes.data || []);

        // 2. ดึงข้อมูลโพสต์
        const postRes = await axios.get(`${API_URL}/posts`);
        setPosts(postRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const catSlug = post.category?.slug || '';
    const matchesTab = filter === 'all' || catSlug === filter;

    const catName = post.category?.name || '';
    const matchesSearch = queryText === '' ||
      post.title.toLowerCase().includes(queryText) ||
      (post.content || '').toLowerCase().includes(queryText) ||
      catName.toLowerCase().includes(queryText);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-background font-sans selection:bg-[#C5A059]/20 selection:text-[#8A6E3E] transition-colors duration-500">

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 relative overflow-hidden flex flex-col items-center">

        {/* Animated Background Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] bg-[#C5A059]/10 rounded-[100%] blur-[100px] sm:blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-40 left-[10%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-rose-600/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float opacity-70"></div>
        <div className="absolute top-20 right-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-teal-600/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float opacity-70" style={{ animationDelay: '2s' }}></div>

        {/* Floating Badge (Above 3D animation) */}
        <div className="relative z-20 mt-8 mb-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-white max-sm:border-[#C5A059]/30 shadow-[0_8px_30px_rgba(197,160,89,0.15)] text-xs font-bold text-[#C5A059] tracking-widest uppercase animate-in fade-in slide-in-from-top-10 duration-1000">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C5A059]"></span>
            </span>
            {t('home.masterYourElement')}
          </div>
        </div>

        {/* 3D Animated Logo Scene (Replacing Spline) */}
        <div className="w-full relative h-[400px] sm:h-[500px] w-full max-w-7xl mx-auto flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 z-10 my-4">
          <div className="relative w-64 h-64 sm:w-[350px] sm:h-[350px] rounded-full flex items-center justify-center group perspective-1000">
            {/* Outer rings spinning */}
            <div className="absolute inset-0 border-[3px] border-[#C5A059]/30 border-dashed rounded-full animate-[spin_15s_linear_infinite] group-hover:border-[#C5A059]/60 transition-colors duration-500"></div>
            <div className="absolute inset-[-25px] border-2 border-stone-800/10 rounded-full animate-[spin_25s_linear_infinite_reverse]"></div>
            <div className="absolute inset-[-50px] border-2 border-[#C5A059]/10 rounded-full animate-[spin_35s_linear_infinite]"></div>
            <div className="absolute inset-[-75px] border-2 border-stone-800/5 border-dotted rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

            {/* Floating & Tilting Logo */}
            <div className="relative w-[85%] h-[85%] rounded-full overflow-hidden bg-stone-900 border-[6px] border-stone-800 dark:border-stone-900 shadow-[0_0_80px_rgba(197,160,89,0.25)] transition-all duration-700 transform-gpu hover:scale-[1.05] hover:rotate-[10deg] animate-float hover:shadow-[0_0_120px_rgba(197,160,89,0.4)] cursor-pointer">
              <Image
                src="/images/logo1.png"
                alt="Family JS Logo"
                fill
                className="object-cover opacity-90 transition-opacity duration-300 hover:opacity-100 scale-110"
              />
              {/* Glass overlay reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:from-white/10 via-transparent to-black/50 mix-blend-overlay pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/10 dark:from-white/5 to-transparent -skew-y-12 pointer-events-none"></div>
            </div>
          </div>

          {/* Sparkles around the 3D object */}
          <div className="absolute top-10 right-[25%] text-[#C5A059] animate-bounce duration-1000 delay-500 opacity-80 pointer-events-none">
            <Sparkles size={32} fill="currentColor" />
          </div>
          <div className="absolute bottom-10 left-[25%] text-[#8A6E3E] animate-pulse duration-700 opacity-60 pointer-events-none">
            <Star size={24} fill="currentColor" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-20 mt-4 px-4">

          {/* Subheading Quotes */}
          <div className="mb-14 flex flex-col gap-5 items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="relative group perspective-1000 cursor-default">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#C5A059] uppercase tracking-[0.2em] transform-gpu drop-shadow-md transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1">
                {t('home.powerToWin')}
              </h2>
              <div className="w-0 group-hover:w-[120%] h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent transition-all duration-700 mx-auto mt-3 -translate-x-[10%] opacity-50"></div>
            </div>
          </div>

          {/* <p className="text-base sm:text-lg md:text-xl text-stone-500 max-w-3xl mx-auto mb-16 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            "วิถีแห่งผู้ชนะไม่ได้วัดกันที่ความเร็ว แต่คือความมั่นคงของ
            <span className="inline-block font-semibold text-stone-800 bg-white border border-stone-200 shadow-sm px-3 py-1 rounded-lg mx-1.5 transform hover:-translate-y-1 transition-transform cursor-default z-10 relative">จิตใจ</span>
            และ
            <span className="inline-block font-semibold text-stone-800 bg-white border border-stone-200 shadow-sm px-3 py-1 rounded-lg mx-1.5 transform hover:-translate-y-1 transition-transform cursor-default z-10 relative">พละกำลัง</span>
            ที่ผ่านการฝึกฝนอย่างประณีต"
          </p> */}

          {/* Dynamic Filter Tabs (Glassmorphism + Modern Pill Design) */}
          <div className="flex justify-center animate-in fade-in zoom-in duration-700 delay-700 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar w-full">
            <div className="inline-flex items-center gap-2 p-2 bg-white/60 dark:bg-stone-900/60 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white dark:border-stone-700/50 min-w-max relative z-20 hover:shadow-[0_8px_32px_rgba(197,160,89,0.15)] transition-shadow duration-500">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 sm:px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-500 flex items-center gap-2 ${filter === 'all'
                  ? 'bg-gradient-to-tr from-stone-900 to-stone-700 text-white shadow-lg shadow-stone-900/20 scale-[1.02] -translate-y-0.5'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-white dark:hover:bg-stone-800'
                  }`}
              >
                <LayoutGrid size={16} className={filter === 'all' ? 'animate-pulse text-[#C5A059]' : ''} />
                {t('home.allStories')}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setFilter(cat.slug)}
                  className={`
                    px-6 sm:px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-500 whitespace-nowrap
                    ${filter === cat.slug
                      ? 'bg-gradient-to-tr from-stone-900 to-stone-700 text-white shadow-lg shadow-stone-900/20 scale-[1.02] -translate-y-0.5'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white dark:hover:bg-stone-800'}
                  `}
                >
                  <span className={filter === cat.slug ? 'text-transparent bg-clip-text bg-gradient-to-r from-stone-100 to-[#C5A059]' : ''}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-6xl mx-auto px-4 pb-24">

        {queryText && !loading && (
          <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              {t('home.searchResultsFor')} <span className="text-[#C5A059]">"{queryText}"</span>
            </h2>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-2 text-xs text-stone-400 dark:text-stone-500 hover:text-[#C5A059] dark:hover:text-[#C5A059] underline"
            >
              {t('home.clearSearch')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
            <Loader2 size={40} className="animate-spin text-[#C5A059]" />
            <p className="font-medium tracking-wide">{t('home.syncingMsg')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem] mx-auto max-w-lg bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-stone-600">
              <LayoutGrid size={24} />
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-medium px-6 leading-relaxed">
              {queryText
                ? t('home.noResultsSearch')
                : t('home.noResultsDefault')}
            </p>
          </div>
        )}
      </main>

      <footer className="py-12 text-center border-t border-stone-200 dark:border-stone-800 mx-8">
        <p className="text-stone-400 dark:text-stone-500 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} Family JS. <br className="md:hidden" />
          Body & Mind Development Do.
        </p>
      </footer>
    </div>
  );
};

// --- 3. EXPORT DEFAULT ---
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#1c1917]">
        <Loader2 size={40} className="animate-spin text-[#C5A059]" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}