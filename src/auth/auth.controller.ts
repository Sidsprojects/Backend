import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from 'src/Dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() payload: RegisterDto) {
        return this.authService.register(payload)
    }

    @Post('Login')
    async Login(@Body() payload: LoginDto) {
        return this.authService.login(payload)
    }
}
