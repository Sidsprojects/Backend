import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { LoggerService } from 'src/common/logger/logger.service';
import { isInstance } from 'class-validator';
import { ReddisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private logger: LoggerService,
        private redisService: ReddisService
    ) { }

    // Used to register the user to the app
    async register(data: any) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: data.email }
            })

            if (existingUser) {
                throw new BadRequestException(`User with Email ${data.email ?? ''} already exists`)
            }

            const hashedPassword = await bcrypt.hash(data.password, 10)

            const user = await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                },
            });

            return {
                message: 'User registered successfully',
                user,
            };

        } catch (err) {
            throw new BadRequestException({
                message: err,
            })
        }
    }

    async login(data: any) {
        try {

            const redis = this.redisService.getClient()
            
            const user = await this.prisma.user.findUnique({
                where: { email: data.email ?? '' }
            })

            if(!user) {
                throw new BadRequestException('Invalid credentials')
            }

            let comparePassword = await bcrypt.compare(data.password.trim(),user.password.trim())
            if(!comparePassword) {
                throw new UnauthorizedException('Invalid credentials')
            }

            const accessToken = this.jwtService.sign({
                secret: process.env.JWT_SECRET,
                expiresIn: '1h'
            })

            const refreshToken = this.jwtService.sign({
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d'
            })

            await redis.set(`refresh_token_${user.id}`, refreshToken, 'EX', 7*24*60*60)

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        } catch (error) {
            this.logger.log(JSON.stringify(error))
            throw new BadRequestException({
                message: error
            })
        }
    }
}
