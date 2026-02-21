'use client';

import React, { useState, useEffect, Suspense } from 'react'; // 1. เพิ่ม Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

// 2. เปลี่ยนชื่อฟังก์ชันหลักเป็นชื่ออื่น (เช่น SearchBarContent)
// และเอา export default ออกจากตรงนี้
function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get('q') || '');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text !== searchParams.get('q')) {
        if (text) {
          router.push(`/?q=${text}`);
        } else {
          router.push('/');
        }
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [text, router, searchParams]);

  return (
    <div className={`relative flex items-center transition-all duration-300 ${isExpanded || text ? 'w-[180px] md:w-[220px]' : 'w-[40px]'}`}>
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
        <Search size={20} className={`${isExpanded || text ? 'text-[#C5A059]' : 'text-stone-400'} transition-colors`} />
      </div>
      <input
        type="text"
        value={text}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => !text && setIsExpanded(false)}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search..."
        className={`
          w-full py-2 pl-10 pr-4 bg-white border border-stone-200 rounded-full text-sm text-stone-700 placeholder-stone-400 outline-none
          focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/50 shadow-sm transition-all duration-300
          ${isExpanded || text ? 'opacity-100 px-4 cursor-text' : 'opacity-0 px-0 cursor-pointer'} 
        `}
      />
      {!isExpanded && !text && (
        <div 
          onClick={() => setIsExpanded(true)} 
          className="absolute inset-0 cursor-pointer z-20"
          title="Click to search"
        />
      )}
    </div>
  );
}

// 3. สร้าง Component ใหม่สำหรับ Export แล้วห่อด้วย Suspense
export default function SearchInput() {
  return (
    // fallback คือสิ่งที่แสดงระหว่างรอโหลดข้อมูล URL (ใส่ div เปล่าๆ กัน layout ขยับ)
    <Suspense fallback={<div className="w-[40px] h-10" />}>
      <SearchBarContent />
    </Suspense>
  );
}