'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Wallet, ArrowLeft, Share2, Bookmark, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import SearchInput from '@/app/components/SearchInput'; // เปิดใช้งาน Search ได้แล้วครับ (ถ้า SearchInput ปกติ)
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { LanguageToggle } from '@/app/components/LanguageToggle';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePrivateOpen, setIsMobilePrivateOpen] = useState(false);
  const { t } = useLanguage();

  // --- 1. FIXED SCROLL LOGIC (แก้ปัญหาหน้ากระพริบ) ---
  useEffect(() => {
    const handleScroll = () => {
      const isOverThreshold = window.scrollY > 20;
      // เช็คค่าก่อน Set State! ถ้าค่าเหมือนเดิม ไม่ต้อง Set ซ้ำ
      setScrolled(prev => {
        if (prev !== isOverThreshold) return isOverThreshold;
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ปิดเมนูมือถืออัตโนมัติ เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobilePrivateOpen(false);
  }, [pathname]);

  // --- State สำหรับ hamburger menu ในหน้าย่อย ---
  const [isSubPageMenuOpen, setIsSubPageMenuOpen] = useState(false);
  const [isSubPagePrivateOpen, setIsSubPagePrivateOpen] = useState(false);

  // ปิดเมนูย่อยเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsSubPageMenuOpen(false);
    setIsSubPagePrivateOpen(false);
  }, [pathname]);

  // --- CASE 1: หน้า ABOUT (โชว์ปุ่ม Back + Hamburger Menu บน Mobile) ---
  // (ผมเอา /memories ออกจากตรงนี้ เพื่อให้ Gallery มีเมนูเต็มๆ ครับ)
  if (pathname === '/about' || pathname === '/resume' || pathname === '/memories' || pathname === '/documents' || pathname === '/money' || pathname === '/blog') {
    return (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isSubPageMenuOpen ? 'bg-white/95 dark:bg-[#1c1917]/95 backdrop-blur-md shadow-lg' : 'mix-blend-difference'}`}>
        <div className="max-w-7xl mx-auto w-full px-6">
          {/* Top Row */}
          <div className={`flex justify-between items-center h-20 ${isSubPageMenuOpen ? 'text-stone-800 dark:text-stone-100' : 'text-white'}`}>
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity group pointer-events-auto">
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold tracking-widest uppercase">{t('nav.back')}</span>
            </Link>

            <div className="flex items-center gap-3 pointer-events-auto">
              <LanguageToggle />
              {/* Hamburger button - mobile only */}
              <button
                onClick={() => setIsSubPageMenuOpen(!isSubPageMenuOpen)}
                className="md:hidden p-2 hover:opacity-70 transition-opacity"
              >
                {isSubPageMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isSubPageMenuOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col items-center gap-4 pt-4 border-t border-stone-200 dark:border-stone-700">
              <MobileNavLink href="/" current={pathname}>{t('nav.home')}</MobileNavLink>
              <MobileNavLink href="/about" current={pathname}>{t('nav.about')}</MobileNavLink>
              <MobileNavLink href="/blog" current={pathname}>Blog</MobileNavLink>

              {/* Private Zone */}
              <div className="w-full flex flex-col items-center gap-2">
                <button
                  onClick={() => setIsSubPagePrivateOpen(!isSubPagePrivateOpen)}
                  className={`flex items-center gap-1 text-base font-medium outline-none transition-colors ${(pathname === '/memories' || pathname === '/documents' || pathname === '/resume') ? 'text-[#C5A059]' : 'text-stone-600 dark:text-stone-300 hover:text-[#C5A059] dark:hover:text-[#C5A059]'}`}
                >
                  {t('nav.privateZone')} <ChevronDown size={16} className={`${isSubPagePrivateOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out w-[85%] max-w-sm ${isSubPagePrivateOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col items-center gap-3 py-3 mt-1 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/80 rounded-2xl">
                    <MobileNavLink href="/memories" current={pathname}>{t('nav.gallery')}</MobileNavLink>
                    <MobileNavLink href="/documents" current={pathname}>{t('nav.vault')}</MobileNavLink>
                    <MobileNavLink href="/resume" current={pathname}>{t('nav.resume')}</MobileNavLink>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 w-full mt-2">
                <ThemeToggle />
                <Link href="/login" className="flex-1 max-w-[200px] py-2.5 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 text-sm font-bold rounded-full hover:bg-[#C5A059] dark:hover:bg-[#C5A059] text-center transition-all">
                  {t('nav.login')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // --- CASE 2: หน้า BLOG DETAIL ---
  if (pathname.startsWith('/blog/')) {
    return (
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-stone-100 z-50 h-16 flex items-center">
        <div className="max-w-4xl mx-auto w-full px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-[#C5A059] transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t('nav.back')}</span>
          </Link>
          <div className="text-sm font-bold text-stone-800 dark:text-stone-100 tracking-tight uppercase opacity-50 hidden md:block">
            Family JS
          </div>
          <div className="flex items-center gap-3 text-stone-400 dark:text-stone-600">
            <LanguageToggle />
            {/* <button className="hover:text-[#C5A059] transition-colors"><Bookmark size={20} /></button>
            <button className="hover:text-[#C5A059] transition-colors"><Share2 size={20} /></button> */}
          </div>
        </div>
      </nav>
    );
  }

  // --- CASE 3: ซ่อน Navbar หน้า Admin/Login ---
  if (pathname === '/login' || pathname.startsWith('/admin')) {
    return null;
  }

  // --- CASE 4: MAIN NAVBAR (HOME, MEMORIES, MONEY) ---
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 px-4 pointer-events-none">
      <nav className={`
        pointer-events-auto
        relative flex flex-col md:flex-row items-center justify-between px-6 py-3 rounded-[2rem] transition-all duration-300
        ${scrolled || isMobileMenuOpen
          ? 'w-full max-w-5xl bg-white/90 dark:bg-[#1c1917]/90 backdrop-blur-md shadow-lg shadow-stone-200/50 dark:shadow-none border border-white/40 dark:border-stone-800'
          : 'w-full max-w-6xl bg-transparent'}
      `}>

        {/* === TOP ROW: Logo + Mobile Actions === */}
        <div className="w-full flex items-center justify-between md:w-auto">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center gap-3 group cursor-pointer pl-2">
              <div className="relative w-[3.25rem] h-[3.25rem] shadow-lg shadow-[#C5A059]/20 rounded-full overflow-hidden transform group-hover:scale-110 transition-all duration-300 bg-white">
                <Image
                  src="/images/logo1.png"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-extrabold tracking-tight leading-none uppercase font-sans ${scrolled || isMobileMenuOpen ? 'text-stone-800 dark:text-stone-100' : 'text-stone-800 dark:text-stone-100'}`}>
                Family JS
              </span>
              <span className="text-[0.6rem] font-bold text-[#C5A059] tracking-widest uppercase leading-tight">
                Body & Mind Dev.
              </span>
            </div>
          </Link>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {/* <SearchInput />  <-- ถ้า SearchInput ไม่มีปัญหา เปิดใช้ได้ครับ */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-800 dark:text-stone-200 hover:text-[#C5A059] dark:hover:text-[#C5A059] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* === DESKTOP MENU === */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/" current={pathname}>{t('nav.home')}</NavLink>
          <NavLink href="/about" current={pathname}>{t('nav.about')}</NavLink>
          <NavLink href="/blog" current={pathname}>Blog</NavLink>
          {/* <NavLink href="/resume" current={pathname}>{t('nav.resume')}</NavLink> */}

          {/* Private Zone Dropdown (Desktop) */}
          <div className="relative group py-2">
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors outline-none ${pathname === '/memories' || pathname === '/documents' ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}>
              {t('nav.privateZone')} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-44 bg-white/90 dark:bg-[#1c1917]/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-stone-100 dark:border-stone-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col p-2 translate-y-2 group-hover:translate-y-0">
              <Link href="/memories" className={`px-4 py-2.5 text-sm rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#C5A059] transition-colors ${pathname === '/memories' ? 'text-[#C5A059] bg-stone-50/50 dark:bg-stone-800/80' : 'text-stone-600 dark:text-stone-300'}`}>{t('nav.gallery')}</Link>
              <Link href="/documents" className={`px-4 py-2.5 mt-1 text-sm rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#C5A059] transition-colors ${pathname === '/documents' ? 'text-[#C5A059] bg-stone-50/50 dark:bg-stone-800/80' : 'text-stone-600 dark:text-stone-300'}`}>{t('nav.vault')}</Link>
              <Link href="/resume" className={`px-4 py-2.5 mt-1 text-sm rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#C5A059] transition-colors ${pathname === '/resume' ? 'text-[#C5A059] bg-stone-50/50 dark:bg-stone-800/80' : 'text-stone-600 dark:text-stone-300'}`}>{t('nav.resume')}</Link>
            </div>
          </div>

          {/* 👇 เพิ่มเมนู Wallet */}
          {/* <NavLink href="/money" current={pathname}>
             <span className="flex items-center gap-1">
               <Wallet size={16} className="opacity-80" /> Wallet
             </span>
          </NavLink> */}
        </div>

        {/* === DESKTOP ACTIONS === */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <SearchInput />
          <Link href="/login" className="px-5 py-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 text-xs font-bold rounded-full hover:bg-[#C5A059] dark:hover:bg-[#C5A059] transition-all hover:scale-105 hover:shadow-md">
            {t('nav.login')}
          </Link>
        </div>

        {/* === MOBILE MENU DROPDOWN === */}
        {isMobileMenuOpen && (
          <div className="w-full flex flex-col items-center gap-4 pt-6 pb-2 md:hidden border-t border-stone-100 dark:border-stone-800 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <MobileNavLink href="/" current={pathname}>{t('nav.home')}</MobileNavLink>
            <MobileNavLink href="/about" current={pathname}>{t('nav.about')}</MobileNavLink>
            <MobileNavLink href="/blog" current={pathname}>Blog</MobileNavLink>
            {/* <MobileNavLink href="/resume" current={pathname}>{t('nav.resume')}</MobileNavLink> */}

            <div className="w-full flex flex-col items-center gap-2">
              <button
                onClick={() => setIsMobilePrivateOpen(!isMobilePrivateOpen)}
                className={`flex items-center gap-1 text-base font-medium outline-none transition-colors ${(pathname === '/memories' || pathname === '/documents') ? 'text-[#C5A059]' : 'text-stone-600 dark:text-stone-300 hover:text-[#C5A059] dark:hover:text-[#C5A059]'}`}
              >
                {t('nav.privateZone')} <ChevronDown size={16} className={`${isMobilePrivateOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
              </button>

              {isMobilePrivateOpen && (
                <div className="w-[85%] max-w-sm flex flex-col items-center gap-3 py-3 mt-1 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/80 rounded-2xl animate-in fade-in duration-200">
                  <MobileNavLink href="/memories" current={pathname}>{t('nav.gallery')}</MobileNavLink>
                  <MobileNavLink href="/documents" current={pathname}>{t('nav.vault')}</MobileNavLink>
                  <MobileNavLink href="/resume" current={pathname}>{t('nav.resume')}</MobileNavLink>
                </div>
              )}
            </div>

            {/* 👇 เพิ่มเมนู Wallet Mobile */}
            {/* <MobileNavLink href="/money" current={pathname}>
              <span className="flex items-center gap-2">
                <Wallet size={18} /> Wallet (Private)
              </span>
            </MobileNavLink> */}

            <div className="flex items-center justify-center gap-4 w-full mt-2">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/login" className="flex-1 py-2.5 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 text-sm font-bold rounded-full hover:bg-[#C5A059] dark:hover:bg-[#C5A059] text-center">
                {t('nav.login')}
              </Link>
            </div>
          </div>
        )}

      </nav>
    </div>
  );
}

// --- SUB COMPONENTS (เพื่อความสะอาด) ---

function NavLink({ href, current, children }: { href: string, current: string, children: React.ReactNode }) {
  const isActive = current === href;
  return (
    <Link href={href} className={`text-sm font-medium transition-colors relative group ${isActive ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}>
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A059] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
    </Link>
  );
}

function MobileNavLink({ href, current, children }: { href: string, current: string, children: React.ReactNode }) {
  const isActive = current === href;
  return (
    <Link href={href} className={`text-base font-medium transition-colors ${isActive ? 'text-[#C5A059]' : 'text-stone-600 dark:text-stone-300 hover:text-[#C5A059] dark:hover:text-[#C5A059]'}`}>
      {children}
    </Link>
  );
}