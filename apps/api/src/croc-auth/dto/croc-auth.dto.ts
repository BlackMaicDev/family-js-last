import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterCrocDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginCrocDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
