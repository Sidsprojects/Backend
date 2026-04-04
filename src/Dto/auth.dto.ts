import { IsAlphanumeric, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: "The email must be in valid format"})
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, {message: "password must be greater than 6 charectors"})
    @IsAlphanumeric()
    password: string;
}

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}