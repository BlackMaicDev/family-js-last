# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. ก๊อปปี้ไฟล์ที่จำเป็นสำหรับ install dependencies (monorepo)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# 2. ติดตั้ง pnpm + dependencies
RUN npm install -g pnpm && pnpm install

# 3. ก๊อปปี้ซอร์สโค้ด API ทั้งหมด (รวม prisma/, tsconfig, nest-cli ฯลฯ)
COPY apps/api ./apps/api

# 4. Generate Prisma Client & Build
RUN cd apps/api && pnpm exec prisma generate
RUN pnpm --filter api build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# เราจะไม่รัน pnpm install ใหม่ใน Stage 2 เลย (หลีกเลี่ยง error npx prisma command not found อย่างเด็ดขาด)
# เราจะหยิบ node_modules และ dist จาก stage แรกมาใช้แทน

# 1. ก๊อปปี้ package manager
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# 2. ก๊อปปี้ source และ build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# 3. สร้าง Public folder
RUN mkdir -p /app/apps/api/public/uploads

# ตั้งค่า Environment พื้นฐาน
ENV NODE_ENV=production
EXPOSE 3000

CMD sh -c "cd apps/api && npx prisma db push --skip-generate && cd /app && node apps/api/dist/src/main.js"