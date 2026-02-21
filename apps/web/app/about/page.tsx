'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Quote, Terminal, Github, Linkedin, Mail } from 'lucide-react';



export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans">
      
     {/* =========================================
          THE FOUNDER
      ========================================= */}
      <section className="bg-stone-950 py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5A059] rounded-full blur-[180px] opacity-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            
       {/* Profile Image */}
<div className="relative group shrink-0">
  
  {/* แสงด้านหลัง (Glow effect) */}
  <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A059] to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
  
  {/* กรอบรูป */}
  <div className={`
    relative w-56 h-56 md:w-72 md:h-72 rounded-full border-4 border-stone-800 shadow-2xl overflow-hidden bg-stone-900
    transition-all duration-700
    
    /* Effect สี: ปกติจะนวลๆ สว่างๆ -> Hover แล้วเข้มชัด */
    brightness-110 saturate-70 opacity-90
    group-hover:brightness-100 group-hover:saturate-100 group-hover:opacity-100
  `}>
    <Image 
      src="/images/497708.jpg" 
      alt="Founder" 
      fill 
      /* ✨ แก้ตรงนี้ครับ ✨ */
      /* object-cover: ขยายรูปให้เต็มวง (หน้าจะใหญ่ชัด) */
      /* object-top:  บังคับให้โฟกัสส่วนบนของรูป (กันหัวโดนตัด ถ้าเป็นรูปแนวตั้ง) */
      className="object-cover object-top" 
    />
  </div>
</div>

            {/* Content */}
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-1.5 mb-6 border border-[#C5A059]/30 rounded-full text-[10px] font-bold text-[#C5A059] tracking-[0.2em] uppercase">
                The Founder
              </div>
              
              <h3 className="text-4xl md:text-6xl font-bold text-white mb-3 font-serif">
                Sorachot <span className="text-stone-600">.J</span>
              </h3>
              <p className="text-indigo-400 text-sm font-medium tracking-wide mb-10 uppercase">
                Full Stack Developer & Calisthenics Athlete & Reader
              </p>

              <div className="relative">
                <Quote className="absolute -top-6 -left-4 text-[#C5A059] opacity-20 rotate-180" size={50} />
                <p className="text-xl md:text-2xl text-stone-300 font-light italic leading-relaxed mb-8 pl-8 border-l-2 border-[#C5A059]">
                  "ผมปฏิเสธที่จะเลือกทางใดทางหนึ่ง... <br className="hidden lg:block"/>
                  เพราะมนุษย์ที่สมบูรณ์แบบ ต้องมีทั้ง <span className="text-white font-medium">'กายที่พร้อมรบ'</span> <span className="text-indigo-300 font-medium">'สมองที่สร้างสรรค์'</span> และ <span className="text-[#C5A059] font-medium">'จิตวิญญาณที่ลึกซึ้ง'</span>"
                </p>
              </div>

              <div className="flex justify-center md:justify-start gap-5 mt-10">
                {[Github, Linkedin, Mail].map((Icon, idx) => (
                  <button key={idx} className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-[#C5A059] hover:bg-[#C5A059] transition-all duration-300">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>


      <div className="flex flex-col lg:flex-row">
        
        
        {/* =========================================
            ZONE 1: SCALE (Body) - THE TANK
        ========================================= */}
        <section className="relative w-full lg:w-1/3 min-h-[60vh] lg:min-h-screen bg-stone-900 flex flex-col justify-center px-8 py-20 text-white border-r border-stone-800 group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Image */}
            <div className="mb-8 relative w-40 h-40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(197,160,89,0.3)] border-4 border-[#C5A059]/20 bg-stone-800 transition-transform duration-700 group-hover:scale-105">
               <Image src="/images/crocodile-scale.png" alt="Scale Logo" fill className="object-cover" />
            </div>

            <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-stone-100 to-stone-600">Scale</h2>
            <p className="text-[#C5A059] font-bold tracking-[0.3em] uppercase text-xs mb-8">
              Resilience of Body
            </p>
            
            {/* --- คำอธิบายเท่ๆ --- */}
            <div className="max-w-xs mx-auto space-y-4">
              <p className="text-stone-300 font-serif italic text-lg leading-relaxed">
                "กายหยาบคือป้อมปราการด่านแรก..."
              </p>
              <p className="text-stone-500 font-light text-sm leading-loose">
                เราตีบวกเกราะให้หนาด้วยวินัย และความเจ็บปวดจากการฝึกฝน 
                เพื่อให้ร่างกายนี้พร้อมแบกรับ <span className="text-white font-medium">ทุกความฝันที่หนักอึ้ง</span>
              </p>
            </div>
          </div>
        </section>


        {/* =========================================
            ZONE 2: CODE (Tech) - THE ARCHITECT
        ========================================= */}
        <section className="relative w-full lg:w-1/3 min-h-[60vh] lg:min-h-screen bg-[#0F172A] flex flex-col justify-center px-8 py-20 text-white border-r border-stone-800 group">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366F1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Image/Icon */}
            <div className="mb-8 relative w-40 h-40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.4)] border-4 border-indigo-500/30 bg-[#1E293B] flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
               <Terminal size={64} className="text-indigo-400" />
            </div>

            <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-indigo-200 to-indigo-600">Code</h2>
            <p className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs mb-8">
              Logic of Creation
            </p>
            
            {/* --- คำอธิบายเท่ๆ --- */}
            <div className="max-w-xs mx-auto space-y-4">
              <p className="text-indigo-200 font-serif italic text-lg leading-relaxed">
                "โลกดิจิทัลคือกระดาษเปล่า..."
              </p>
              <p className="text-slate-400 font-light text-sm leading-loose">
                และโค้ดคือ <span className="text-indigo-300 font-medium">ปากกาของพระเจ้า</span> 
                เราไม่ได้แค่เขียนโปรแกรม แต่เรากำลังออกแบบระบบระเบียบ
                เพื่อเปลี่ยนจินตนาการให้กลายเป็นความจริง
              </p>
            </div>

            <div className="mt-8 px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] text-indigo-300 font-mono animate-pulse">
              &lt;Building the Future /&gt;
            </div>
          </div>
        </section>


        {/* =========================================
            ZONE 3: SKILL (Mind) - THE SAGE
        ========================================= */}
        <section className="relative w-full lg:w-1/3 min-h-[60vh] lg:min-h-screen bg-[#FAFAF9] flex flex-col justify-center px-8 py-20 text-stone-900 group">
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Image */}
            <div className="mb-8 relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white transition-transform duration-700 group-hover:scale-105">
               <Image src="/images/reading-man.png" alt="Skill Logo" fill className="object-cover" />
            </div>

            <h2 className="text-5xl font-bold font-serif mb-2 text-stone-900">Skill</h2>
            <p className="text-stone-400 font-bold tracking-[0.3em] uppercase text-xs mb-8">
              Clarity of Mind
            </p>
            
            {/* --- คำอธิบายเท่ๆ --- */}
            <div className="max-w-xs mx-auto space-y-4">
              <p className="text-stone-600 font-serif italic text-lg leading-relaxed">
                "ในโลกที่เสียงดัง... คนที่นิ่งที่สุดคือผู้ชนะ"
              </p>
              <p className="text-stone-500 font-serif font-light text-sm leading-loose">
                ปัญญาจากการตกผลึกคืออาวุธที่มองไม่เห็น 
                แต่ <span className="text-stone-900 font-medium">เฉียบคม</span> ยิ่งกว่าใบมีดใดๆ 
                ช่วยให้เรามองทะลุภาพลวงตาแห่งความวุ่นวาย
              </p>
            </div>

            <div className="mt-8">
               <Quote size={24} className="text-[#C5A059] mx-auto opacity-50"/>
            </div>
          </div>
        </section>
      </div>


      
    </div>
  );
}