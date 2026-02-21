import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail({}, { message: 'รูปแบบ Email ไม่ถูกต้อง' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    password: string;

    @IsString()
    @IsOptional()
    nickname?: string;
}