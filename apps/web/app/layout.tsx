// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/app/components/Navbar'; // Import มาใช้

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
    <html lang="en">
      <body>
        {/* Navbar ตัวเดียว จัดการให้ทุกหน้า */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}