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
    ) { }

    async createCapture(createCapturesDto: CreateCapturesDto): Promise<Captures> {
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
            return await this.capturesRepository.find({
                relations: ['memos'],
                order: {
                    timestamp: 'ASC',
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to get captures', {
                cause: error,
            });
        }
    }

    async getCaptureById(id: number): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });

            if (!capture) {
                throw new NotFoundException(`Capture with ID ${id} not found`);
            }

            return capture;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to get capture', {
                cause: error,
            });
        }
    }

    async updateCapture(id: number, updateCapturesDto: UpdateCapturesDto): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });

            if (!capture) {
                throw new NotFoundException(`Capture with ID ${id} not found`);
            }

            if (updateCapturesDto.image) {
                capture.image = updateCapturesDto.image;
            }

            return await this.capturesRepository.save(capture);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update capture', {
                cause: error,
            });
        }
    }

    async deleteCapture(id: number): Promise<void> {
        const capture = await this.capturesRepository.findOne({ where: { id } });
        if (!capture) {
            throw new NotFoundException('Capture not found', {
                cause: 'Capture not found',
            });
        }
        await this.capturesRepository.delete(id);
    }
}
