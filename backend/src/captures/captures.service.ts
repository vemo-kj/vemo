import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Captures } from './captures.entity';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';
@Injectable()
export class CapturesService {
    constructor(
        @InjectRepository(Captures)
        private capturesRepository: Repository<Captures>,
    ) {}

    async create(createCapturesDto: CreateCapturesDto): Promise<Captures> {
        try {
            const captures = this.capturesRepository.create(createCapturesDto);
            return await this.capturesRepository.save(captures);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create capture', {
                cause: error,
            });
        }
    }

    async getCaptures(): Promise<Captures[]> {
        try {
            return await this.capturesRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Failed to get captures', {
                cause: error,
            });
        }
    }

    async getCaptureById(id: number): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({ where: { id } });

            if (!capture) {
                throw new NotFoundException('Capture not found', {
                    cause: 'Capture not found',
                });
            }

            return capture;
        } catch (error) {
            throw new InternalServerErrorException('Failed to get capture', {
                cause: error,
            });
        }
    }

    async update(id: number, updateCapturesDto: UpdateCapturesDto): Promise<Captures> {
        const capture = await this.capturesRepository.findOne({ where: { id } });
        if (!capture) {
            throw new NotFoundException('Capture not found', {
                cause: 'Capture not found',
            });
        }
        return await this.capturesRepository.save({ ...capture, ...updateCapturesDto });
    }

    async delete(id: number): Promise<void> {
        const capture = await this.capturesRepository.findOne({ where: { id } });
        if (!capture) {
            throw new NotFoundException('Capture not found', {
                cause: 'Capture not found',
            });
        }
        await this.capturesRepository.delete(id);
    }
}
