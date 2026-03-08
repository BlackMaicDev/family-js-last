# 🏠 Family-js Project

โปรเจกต์ระบบจัดการครอบครัวและ Portfolio ส่วนตัว พัฒนาโดย **Dong JS**
รันบนระบบ **Self-hosted VPS** พร้อมการจัดการด้วย **Coolify**

---

## 🚀 Tech Stack

- **Monorepo Management:** pnpm Workspaces + Turborepo
- **Frontend:** Next.js (App Router), Tailwind CSS, Zustand
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL 16 (Running on Docker)
- **Infrastructure:** Docker Desktop (WSL 2), Coolify PaaS

---

## 📘 คู่มือการ Setup โปรเจกต์ (Phase 1: Foundation)

### 1. การเตรียมสภาพแวดล้อม (Environment Setup)
* **เครื่องคอมพิวเตอร์:** ลง Windows ใหม่สะอาด พร้อมเปิดใช้งาน Virtualization ใน BIOS
* **Docker Desktop:** ติดตั้งเวอร์ชัน AMD64 และตั้งค่าให้ใช้งาน WSL 2 Engine
* **WSL 2:** ติดตั้งผ่าน PowerShell ด้วยคำสั่ง `wsl --install` เพื่อเป็นตัวรัน Docker ให้ลื่นไหล
* **Node.js & pnpm:** ติดตั้ง Node.js และตามด้วย `npm install -g pnpm` เพื่อใช้จัดการ Monorepo

### 2. โครงสร้างโปรเจกต์ (Monorepo Structure)
* **Initialize:** สร้างโฟลเดอร์หลัก `family-js` แล้วรัน `pnpm init`
* **Workspaces:** สร้างไฟล์ `pnpm-workspace.yaml` เพื่อกำหนดที่เก็บ App ต่างๆ (`apps/*`)
* **Git:** ทำการ `git init` ที่โฟลเดอร์นอกสุด (Root) และสร้าง `.gitignore` เพื่อคุมทั้งโปรเจกต์

### 3. การสร้าง Application (Backend & Frontend)
* **Backend (NestJS):** สร้างไว้ที่ `apps/api` โดยใช้ NestJS CLI
* **Frontend (Next.js):** สร้างไว้ที่ `apps/web` โดยใช้สถาปัตยกรรม App Router, TypeScript และ Tailwind CSS

### 4. ระบบฐานข้อมูล (Database Layer)
* **Docker Compose:** สร้างไฟล์ `docker-compose.yml` เพื่อรัน PostgreSQL 16
* **Prisma ORM:** ติดตั้ง Prisma ใน `apps/api` โดยเลือกใช้ เวอร์ชัน 6 เพื่อความเสถียรและความง่ายในการ Config
* **Schema Design:** ออกแบบตารางครอบคลุมระบบ Identity (User/Auth), Content (Blog), และ Utility (Documents)
* **Migration:** รัน `pnpm exec prisma migrate dev` เพื่อเปลี่ยน Schema ให้เป็นตารางจริงใน Database

### 5. เครื่องมือตรวจสอบ (Database GUI)
* **Prisma Studio:** ใช้คำสั่ง `pnpm exec prisma studio` ใน `apps/api` เพื่อเปิดดูและแก้ไขข้อมูลผ่าน Browser (localhost:5555)

---

## 📁 Project Structure

- `apps/web`: ระบบหน้าบ้าน (Next.js)
- `apps/api`: ระบบหลังบ้าน (NestJS)
- `packages/`: โค้ดส่วนกลางที่ใช้ร่วมกัน