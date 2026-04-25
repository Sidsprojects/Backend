import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from 'src/Dto/auth.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('register')
    async register(@Body() payload: RegisterDto) {
        return this.authService.register(payload)
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('Login')
    async Login(@Body() payload: LoginDto) {
        return this.authService.login(payload)
    }
}
