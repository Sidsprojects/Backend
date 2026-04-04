import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
    @UseGuards(JwtAuthGuard)
    @Post('getProfile')
    async getProfile(@Req() payload: any) {
        return {
            message: 'accessing protected routes',
            user: payload.user
        }
    }
}
