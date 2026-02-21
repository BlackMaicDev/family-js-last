import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอก Username' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอก Password' })
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    password: string;
}
