import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// เราตั้งชื่อว่า 'jwt' เพื่อให้ตรงกับ Strategy ที่เราตั้งไว้ข้างบนครับ
export class JwtAuthGuard extends AuthGuard('jwt') { }