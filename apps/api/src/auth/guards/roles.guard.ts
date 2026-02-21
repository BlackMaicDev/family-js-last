import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        // เช็คว่า User ที่ผ่าน JWT Guard มา มี role เป็น ADMIN หรือไม่
        if (user?.role !== 'ADMIN') {
            throw new ForbiddenException('เฉพาะ Admin เท่านั้นที่เข้าถึงได้');
        }
        return true;
    }
}