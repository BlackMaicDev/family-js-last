import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaCrocService } from '../prisma-croc/prisma-croc.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterCrocDto, LoginCrocDto } from './dto/croc-auth.dto';

@Injectable()
export class CrocAuthService {
  constructor(
    private prisma: PrismaCrocService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterCrocDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
      },
    });

    // Remove passwordHash before returning
    const { passwordHash: _, ...result } = newUser;
    return {
      message: 'Registration successful',
      user: result,
    };
  }

  async login(loginDto: LoginCrocDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    
    // Create JWT Token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d', // Mobile apps usually have longer-lived tokens
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    };
  }
}
