import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เพิ่ม body size limit เพื่อรองรับเนื้อหาขนาดใหญ่ (เช่น รูปภาพ base64)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 🍪 เปิดใช้งาน cookie-parser เพื่อให้ API อ่าน Cookie ที่ส่งมาจาก Browser ได้
  app.use(cookieParser());

  // เปิดใช้งาน Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // กรองฟิลด์ที่ไม่ได้ระบุใน DTO ออกไป
    forbidNonWhitelisted: true, // แจ้ง Error ถ้าส่งฟิลด์ที่ไม่อนุญาตเข้ามา
    transform: true,         // แปลง Type ให้อัตโนมัติ
  }));

  // 🔐 CORS สำหรับ HttpOnly Cookie: ต้องระบุ origin ตรงๆ และเปิด credentials: true
  // Browser จะส่ง Cookie มาด้วยทุก Request ก็ต่อเมื่อ allowedOrigins ตรงกัน
  const allowedOrigins = [
    process.env.FRONTEND_URL,        // 🌍 production domain (ตั้งใน Coolify/env)
    'http://localhost:3000',          // local dev: Next.js default
    'http://localhost:3001',          // local dev: Next.js เมื่อ API ใช้ port 3000
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ].filter(Boolean) as string[];     // กรอง undefined ออก (กรณี FRONTEND_URL ไม่ได้ตั้ง)

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // 🔑 สำคัญมาก! ต้องเปิดถึงจะส่ง Cookie ข้าม origin ได้
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('Family JS API')
    .setDescription('The API documentation for Family JS project')
    .setVersion('1.0')
    .addBearerAuth() // สำหรับระบุหน้าเว็บว่า API เราต้องใช้ Token นะ
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // เส้นทาง /api จะเป็นหน้า Swagger
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
