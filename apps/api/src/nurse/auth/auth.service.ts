import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NurseLoginDto } from './dto/nurse-login.dto';

@Injectable()
export class AuthNurseService {
  constructor(
    private prisma: PrismaNurseService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: NurseLoginDto) {
    const nurse = await this.prisma.nurseProfile.findUnique({
      where: { employeeId: loginDto.employeeId },
      include: { ward: true }
    });

    if (!nurse) {
      throw new UnauthorizedException('Invalid credentials (Employee ID not found)');
    }

    if (!nurse.password) {
      throw new UnauthorizedException('Password not set. Please contact Head Nurse to set a temporary password.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, nurse.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials (Wrong Password)');
    }

    const payload = { 
      sub: nurse.id, 
      employeeId: nurse.employeeId,
      position: nurse.position,
      wardId: nurse.wardId 
    };

    const accessToken = await this.jwtService.signAsync(payload, { 
      expiresIn: '7d', 
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY' 
    });

    const { password, ...nurseWithoutPassword } = nurse;

    return {
      message: 'Login successful',
      accessToken,
      user: nurseWithoutPassword
    };
  }

  // Utility method: In a real app, only Head Nurse or Admin can set/reset passwords
  async setPassword(employeeId: string, newPassword: string) {
    if (!newPassword) {
      throw new BadRequestException('Password is required. Make sure your JSON body has {"password": "..."}');
    }

    const nurse = await this.prisma.nurseProfile.findUnique({
      where: { employeeId }
    });

    if (!nurse) {
      throw new NotFoundException('Employee ID not found');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    return this.prisma.nurseProfile.update({
      where: { employeeId },
      data: { password: hashedPassword }
    });
  }
}
