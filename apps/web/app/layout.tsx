// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/app/components/Navbar'; // Import มาใช้
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { LanguageProvider } from '@/app/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'Family JS',
  description: 'Body & Mind Development',
  // ✨ เพิ่มส่วนนี้เข้าไปครับ ✨
  icons: {
    icon: '/images/logo1.png', // ใส่ path รูปโลโก้จระเข้ของคุณ
    apple: '/images/logo1.png', // สำหรับไอคอนบน iPhone/iPad
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <LanguageProvider>
            {/* Navbar ตัวเดียว จัดการให้ทุกหน้า */}
            <Navbar />

            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}