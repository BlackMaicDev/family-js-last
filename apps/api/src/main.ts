import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // เปิดใช้งาน Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // กรองฟิลด์ที่ไม่ได้ระบุใน DTO ออกไป
    forbidNonWhitelisted: true, // แจ้ง Error ถ้าส่งฟิลด์ที่ไม่อนุญาตเข้ามา
    transform: true,         // แปลง Type ให้อัตโนมัติ
  }));
  // เปิดใช้งาน CORS เพื่อให้หน้าเว็บเรียกใช้ API ได้
  app.enableCors();

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
