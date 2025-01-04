import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { SignupRequestsDto } from './dto/signup.requests.dto';
import { UpdateUserDto } from './dto/updateUser.requests.dto';
import { Users } from './users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
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
            name: dto.name,
            email,
            nickname,
            password: hashedPassword,
            birth: dto.birth,
            gender: dto.gender,
            profileImage: dto.profileImage,
            introduction: dto.introduction,
        });

        const savedUser = await this.userRepository.save(user);
        return plainToInstance(Users, savedUser);
    }

    async findById(userId: number): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    async updateUser(userId: number, dto: UpdateUserDto) {
        try {
            const result = await this.userRepository.update(userId, dto);
            if (result.affected === 0) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            return result;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user');
        }
    }
}
