import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Users } from '../users/users.entity';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { LoginRequestDto } from './dto/login.requests.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        private jwtService: JwtService,
        private youtubeAuthService: YoutubeAuthService,
    ) {}

    async signIn(dto: LoginRequestDto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('이메일이나 비밀번호가 잘못되었습니다');
        }

        const isPasswordValid: boolean = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('이메일이나 비밀번호가 잘못되었습니다');
        }

        const payload = { sub: user.id, email: user.email };
        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token,
        };
    }

    async signOut(userId: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'email'],
            });

            if (!user) {
                throw new UnauthorizedException('존재하지 않는 사용자입니다.');
            }

            return {
                success: true,
                message: '로그아웃되었습니다.',
                email: user.email,
            };
        } catch (error) {
            throw new InternalServerErrorException('로그아웃 처리 중 오류가 발생했습니다.', error);
        }
    }
}
