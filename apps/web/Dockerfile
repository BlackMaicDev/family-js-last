# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. ติดตั้ง pnpm และก๊อปปี้ไฟล์จัดการ package
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# เคล็ดลับ Monorepo: ต้อง Copy package.json สำหรับทุกระบบใน Workspace ด้วย
# ไม่อย่างนั้น pnpm จะบ่นว่า lockfile ไม่ตรงกันถ้าหาโปรเจกต์อื่นไม่เจอ
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

# 2. ติดตั้ง Dependencies ทั้งหมด
RUN pnpm install

# 3. ก๊อปปี้โค้ด Web มาทั้งหมด
COPY apps/web ./apps/web

# 4. 🌟 ใส่ ARG เพื่อให้ Next.js ฝัง URL ของ API ลงไปในไฟล์ตอน Build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# 5. Build Next.js
RUN pnpm --filter web build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# สร้าง User/Group เพื่อความปลอดภัย
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 1. ก๊อปปี้ไฟล์ที่ต้องใช้รันในโหมด Standalone
# ใน Monorepo ตัว standalone จะถูกสร้างไว้ตามโครงสร้างโฟลเดอร์
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# 2. 🚀 ปรับ Path การรันให้ตรงกับโครงสร้าง Monorepo
# ปกติถ้าใช้ pnpm workspace ไฟล์ server.js จะอยู่ที่ apps/web/server.js ภายในโฟลเดอร์ standalone
CMD ["node", "apps/web/server.js"]