import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsController } from './uploads.controller';
import * as fs from 'fs';

@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        // ดึงชื่อโฟลเดอร์จาก request body (ถ้าไม่มีให้ใช้ 'misc')
                        const folder = req.body?.folder || 'misc';
                        const path = `./public/uploads/${folder}`;

                        if (!fs.existsSync(path)) {
                            fs.mkdirSync(path, { recursive: true });
                        }
                        cb(null, path);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
            }),
        }),
    ],
    controllers: [UploadsController],
})
export class UploadsModule { }
