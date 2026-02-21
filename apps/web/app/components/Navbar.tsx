'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Wallet, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import Image from 'next/image';
import SearchInput from '@/app/components/SearchInput'; // เปิดใช้งาน Search ได้แล้วครับ (ถ้า SearchInput ปกติ)

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  }, [pathname]);

  // --- CASE 1: หน้า ABOUT (โชว์แค่ปุ่ม Back) ---
  // (ผมเอา /memories ออกจากตรงนี้ เพื่อให้ Gallery มีเมนูเต็มๆ ครับ)
  if (pathname === '/about' || pathname === '/memories' || pathname === '/money') {
    return (
      <nav className="fixed top-0 w-full z-50 h-20 flex items-center mix-blend-difference text-white pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity group">
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-widest uppercase">Back</span>
          </Link>
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
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="text-sm font-bold text-stone-800 tracking-tight uppercase opacity-50 hidden md:block">
            Scale & Skill
          </div>
          <div className="flex gap-3 text-stone-400">
            <button className="hover:text-[#C5A059] transition-colors"><Bookmark size={20} /></button>
            <button className="hover:text-[#C5A059] transition-colors"><Share2 size={20} /></button>
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
          ? 'w-full max-w-5xl bg-white/90 backdrop-blur-md shadow-lg shadow-stone-200/50 border border-white/40'
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
              <span className={`text-lg font-extrabold tracking-tight leading-none uppercase font-sans ${scrolled || isMobileMenuOpen ? 'text-stone-800' : 'text-stone-800'}`}>
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
              className="p-2 text-stone-800 hover:text-[#C5A059] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* === DESKTOP MENU === */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/" current={pathname}>Home</NavLink>
          <NavLink href="/about" current={pathname}>About</NavLink>
          <NavLink href="/memories" current={pathname}>Gallery</NavLink>

          {/* 👇 เพิ่มเมนู Wallet */}
          {/* <NavLink href="/money" current={pathname}>
             <span className="flex items-center gap-1">
               <Wallet size={16} className="opacity-80" /> Wallet
             </span>
          </NavLink> */}
        </div>

        {/* === DESKTOP ACTIONS === */}
        <div className="hidden md:flex items-center gap-3">
          <SearchInput />
          <Link href="/login" className="px-5 py-2 bg-stone-900 text-white text-xs font-bold rounded-full hover:bg-[#C5A059] transition-all hover:scale-105 hover:shadow-md">
            Login
          </Link>
        </div>

        {/* === MOBILE MENU DROPDOWN === */}
        {isMobileMenuOpen && (
          <div className="w-full flex flex-col items-center gap-4 pt-6 pb-2 md:hidden border-t border-stone-100 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <MobileNavLink href="/" current={pathname}>Home</MobileNavLink>
            <MobileNavLink href="/about" current={pathname}>About</MobileNavLink>
            <MobileNavLink href="/memories" current={pathname}>Gallery</MobileNavLink>

            {/* 👇 เพิ่มเมนู Wallet Mobile */}
            <MobileNavLink href="/money" current={pathname}>
              <span className="flex items-center gap-2">
                <Wallet size={18} /> Wallet (Private)
              </span>
            </MobileNavLink>

            <Link href="/login" className="px-8 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full hover:bg-[#C5A059] w-full text-center mt-2">
              Login
            </Link>
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
    <Link href={href} className={`text-sm font-medium transition-colors relative group ${isActive ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}>
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A059] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
    </Link>
  );
}

function MobileNavLink({ href, current, children }: { href: string, current: string, children: React.ReactNode }) {
  const isActive = current === href;
  return (
    <Link href={href} className={`text-base font-medium ${isActive ? 'text-[#C5A059]' : 'text-stone-600 hover:text-[#C5A059]'}`}>
      {children}
    </Link>
  );
}