import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { SignupRequestsDto } from './dto/signup.requests.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async signUp(dto: SignupRequestsDto) {
        const { email, nickname, password } = dto;
        const existingEmail = await this.userRepository.exists({ where: { email } });
        if (existingEmail) {
            throw new ConflictException('이미 존재하는 이메일입니다.');
        }

        const existingNickname = await this.userRepository.exists({
            where: { nickname },
        });
        if (existingNickname) {
            throw new ConflictException('이미 존재하는 닉네임입니다.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            email,
            nickname,
            password: hashedPassword,
            profileImage: dto.profileImage,
            introduction: dto.introduction,
        });

        const savedUser = await this.userRepository.save(user);
        return plainToInstance(User, savedUser);
    }
}
