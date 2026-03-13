'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const Logo3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 700, H = 700;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Initialize particles
    for (let i = 0; i < 70; i++) {
      particlesRef.current.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 200,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const particles = particlesRef.current;

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const alpha = 0.06 * (1 - dist / 80);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(60, 130, 200, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life += 1;

        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * W;
          p.y = Math.random() * H;
        }

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const flickerOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.life * 0.05));

        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, `rgba(50, 120, 200, ${flickerOpacity})`);
        g.addColorStop(0.5, `rgba(40, 100, 180, ${flickerOpacity * 0.3})`);
        g.addColorStop(1, `rgba(40, 100, 180, 0)`);
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Mouse tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const rotateX = isHovered ? mousePos.y * -12 : 0;
  const rotateY = isHovered ? mousePos.x * 12 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[580px] max-w-4xl mx-auto flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{ perspective: '1200px' }}
    >
      {/* Soft radial glow behind everything (on white bg) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-200/25 dark:bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-60"
        style={{ width: '100%', height: '100%' }}
      />

      {/* ========== 3D ORBIT RINGS ========== */}
      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">

        {/* Orbit Ring 1 - Main horizontal (tilted) */}
        <div
          className="absolute"
          style={{
            width: '420px',
            height: '420px',
            animation: 'spin 10s linear infinite',
            transform: 'rotateX(70deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: 'rgba(40, 120, 200, 0.6)',
              borderRightColor: 'rgba(40, 120, 200, 0.25)',
              borderBottomColor: 'rgba(40, 120, 200, 0.05)',
              borderLeftColor: 'rgba(40, 120, 200, 0.25)',
              boxShadow: '0 0 15px rgba(40,120,200,0.15), inset 0 0 15px rgba(40,120,200,0.04)',
              filter: 'blur(0.5px)',
            }}
          />
          {/* Glowing dot on ring */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400"
            style={{ boxShadow: '0 0 10px 3px rgba(60,140,220,0.7), 0 0 25px 6px rgba(60,140,220,0.25)' }}
          />
        </div>

        {/* Orbit Ring 2 - Tilted diagonal */}
        <div
          className="absolute"
          style={{
            width: '380px',
            height: '380px',
            animation: 'spin 14s linear infinite reverse',
            transform: 'rotateX(65deg) rotateY(40deg) rotateZ(20deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1.5px solid transparent',
              borderTopColor: 'rgba(50, 140, 210, 0.45)',
              borderRightColor: 'rgba(50, 140, 210, 0.12)',
              borderBottomColor: 'rgba(50, 140, 210, 0.03)',
              borderLeftColor: 'rgba(50, 140, 210, 0.12)',
              boxShadow: '0 0 12px rgba(50,140,210,0.12), inset 0 0 12px rgba(50,140,210,0.03)',
              filter: 'blur(0.3px)',
            }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400"
            style={{ boxShadow: '0 0 8px 2px rgba(60,160,230,0.6), 0 0 20px 5px rgba(60,160,230,0.2)' }}
          />
        </div>

        {/* Orbit Ring 3 - Wide outer ring */}
        <div
          className="absolute"
          style={{
            width: '480px',
            height: '480px',
            animation: 'spin 20s linear infinite',
            transform: 'rotateX(75deg) rotateY(-15deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(50,130,200,0.12)',
              boxShadow: '0 0 8px rgba(50,130,200,0.06)',
            }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/50"
            style={{ boxShadow: '0 0 6px 2px rgba(60,140,220,0.4)' }}
          />
        </div>

        {/* Orbit Ring 4 - Text ribbon ring "Family JS" */}
        <div
          className="absolute"
          style={{
            width: '350px',
            height: '350px',
            animation: 'spin 18s linear infinite',
            transform: 'rotateX(72deg) rotateY(25deg) rotateZ(-10deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg viewBox="0 0 350 350" className="absolute inset-0 w-full h-full">
            <defs>
              <path id="textRing1" d="M 175,175 m -145,0 a 145,145 0 1,1 290,0 a 145,145 0 1,1 -290,0" fill="none" />
            </defs>
            <text fill="rgba(40,110,180,0.45)" fontSize="13" fontFamily="monospace" fontWeight="bold" letterSpacing="6">
              <textPath href="#textRing1" startOffset="0%">
                FAMILY JS • GROWING TOGETHER • BODY &amp; MIND •
              </textPath>
            </text>
          </svg>
        </div>

        {/* Orbit Ring 5 - Thai text ribbon */}
        <div
          className="absolute"
          style={{
            width: '440px',
            height: '440px',
            animation: 'spin 22s linear infinite reverse',
            transform: 'rotateX(68deg) rotateY(-20deg) rotateZ(15deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg viewBox="0 0 440 440" className="absolute inset-0 w-full h-full">
            <defs>
              <path id="textRing2" d="M 220,220 m -190,0 a 190,190 0 1,1 380,0 a 190,190 0 1,1 -380,0" fill="none" />
            </defs>
            <text fill="rgba(50,120,190,0.3)" fontSize="12" fontWeight="bold" letterSpacing="4">
              <textPath href="#textRing2" startOffset="0%">
                ★ พัฒนาร่างกาย ★ พัฒนาจิตใจ ★ เติบโตไปด้วยกัน ★
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      {/* ========== MAIN 3D CRYSTAL SPHERE ========== */}
      <div
        className="relative z-10 group cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="relative transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Soft outer glow on white */}
          <div
            className="absolute -inset-16 rounded-full transition-all duration-700 pointer-events-none"
            style={{
              background: isHovered
                ? 'radial-gradient(circle, rgba(50,140,220,0.12) 0%, rgba(40,110,190,0.05) 40%, transparent 65%)'
                : 'radial-gradient(circle, rgba(50,140,220,0.08) 0%, rgba(40,110,190,0.03) 40%, transparent 65%)',
              transform: 'translateZ(-60px)',
            }}
          />

          {/* Crystal Sphere */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden shadow-[0_8px_40px_rgba(40,110,190,0.15)]">

            {/* Animated gradient border ring */}
            <div
              className="absolute -inset-[2.5px] rounded-full z-30 pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(50,140,220,0.65), rgba(30,90,170,0.08), rgba(70,170,240,0.5), rgba(30,90,170,0.08), rgba(50,140,220,0.65))',
                padding: '2.5px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'spin 4s linear infinite',
              }}
            />

            {/* Light glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/80 to-sky-100/60 rounded-full" />

            {/* Logo Image */}
            <div className="absolute inset-[4px] rounded-full overflow-hidden z-10">
              <Image
                src="/images/logo1.png"
                alt="Family JS Logo"
                fill
                className="object-cover scale-[1.15] transition-transform duration-1000 group-hover:scale-[1.2]"
                priority
              />
            </div>

            {/* Glass reflection - top arc */}
            <div
              className="absolute inset-0 rounded-full z-20 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    ${isHovered ? 160 + mousePos.x * 40 : 160}deg,
                    rgba(255,255,255,0.5) 0%,
                    rgba(255,255,255,0.2) 15%,
                    transparent 35%,
                    transparent 70%,
                    rgba(100,170,240,0.08) 100%
                  )
                `,
              }}
            />

            {/* Subtle scan lines (hologram) */}
            <div
              className="absolute inset-0 rounded-full z-20 pointer-events-none overflow-hidden opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1.5px, rgba(40,120,200,0.08) 1.5px, rgba(40,120,200,0.08) 3px)',
              }}
            />

            {/* Top highlight crescent */}
            <div
              className="absolute top-[2px] left-[10%] right-[10%] h-[35%] rounded-t-full z-20 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              }}
            />

            {/* Bottom rim light */}
            <div
              className="absolute bottom-0 left-[15%] right-[15%] h-[12%] z-20 pointer-events-none"
              style={{
                background: 'linear-gradient(0deg, rgba(50,130,210,0.1) 0%, transparent 100%)',
                borderRadius: '0 0 50% 50%',
              }}
            />
          </div>

          {/* Outer glow ring */}
          <div
            className="absolute -inset-4 rounded-full z-[-1] transition-all duration-700"
            style={{
              boxShadow: isHovered
                ? `0 0 30px rgba(50,140,220,0.2),
                   0 0 60px rgba(50,140,220,0.08),
                   0 0 90px rgba(50,140,220,0.04)`
                : `0 0 20px rgba(50,140,220,0.12),
                   0 0 50px rgba(50,140,220,0.05)`,
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* ========== LENS FLARE EFFECTS ========== */}
      <div className="absolute top-[20%] right-[22%] z-[3] pointer-events-none">
        <div
          className="w-1 h-1 rounded-full bg-blue-400"
          style={{
            boxShadow: '0 0 5px 2px rgba(60,140,220,0.6), 0 0 15px 5px rgba(60,140,220,0.25), 0 0 30px 10px rgba(60,140,220,0.08)',
            animation: 'twinkle 3s ease-in-out infinite',
          }}
        />
      </div>
      <div className="absolute top-[30%] left-[18%] z-[3] pointer-events-none">
        <div
          className="w-0.5 h-0.5 rounded-full bg-sky-400"
          style={{
            boxShadow: '0 0 4px 1px rgba(50,160,230,0.5), 0 0 12px 3px rgba(50,160,230,0.2)',
            animation: 'twinkle 4s ease-in-out infinite 1s',
          }}
        />
      </div>
      <div className="absolute bottom-[25%] right-[15%] z-[3] pointer-events-none">
        <div
          className="w-0.5 h-0.5 rounded-full bg-blue-300"
          style={{
            boxShadow: '0 0 4px 1px rgba(70,150,220,0.5), 0 0 10px 3px rgba(70,150,220,0.15)',
            animation: 'twinkle 5s ease-in-out infinite 2s',
          }}
        />
      </div>

      {/* ========== CORNER HUD BRACKETS (subtle on white) ========== */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 w-5 h-5 sm:w-7 sm:h-7 border-l border-t border-blue-300/25 pointer-events-none z-[3] rounded-tl-sm" />
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-5 h-5 sm:w-7 sm:h-7 border-r border-t border-blue-300/25 pointer-events-none z-[3] rounded-tr-sm" />
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 w-5 h-5 sm:w-7 sm:h-7 border-l border-b border-sky-300/25 pointer-events-none z-[3] rounded-bl-sm" />
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-5 h-5 sm:w-7 sm:h-7 border-r border-b border-sky-300/25 pointer-events-none z-[3] rounded-br-sm" />

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default Logo3D;
