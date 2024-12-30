import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { YoutubeauthService } from '../youtubeauth/youtubeauth.service';
import { LoginRequestDto } from './dto/login.requests.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private youtubeauthService: YoutubeauthService,
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
            redirectUrl: this.youtubeauthService.getAuthUrl(),
        };
    }

    async signOut(userId: number) {
        return { message: '로그아웃되었습니다.' };
    }
}
