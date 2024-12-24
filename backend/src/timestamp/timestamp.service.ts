import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimestampList } from './entity/timestamp_list.entity';
import { Timestamp } from './entity/timestamp.entity';
import { Repository } from 'typeorm';
import { CreateTimestampDto } from './dto/create-timestamp.dto';

@Injectable()
export class TimestampService {
    constructor(
        @InjectRepository(TimestampList)
        private timestampListRepository: Repository<TimestampList>,
        @InjectRepository(Timestamp)
        private timestampRepository: Repository<Timestamp>,
    ) {}

    // create 생성
    // vedeoId에 해당하는 리스트가 있는지 확인
    async create(createTimestampDto: CreateTimestampDto): Promise<Timestamp> {
        let timestampList = await this.timestampListRepository.findOne({
            where: { videoId: createTimestampDto.videoId },
        });

        // 타임스탬프 리스트가 없으면 새로 생성
        if (!timestampList) {
            timestampList = this.timestampListRepository.create({
                videoId: createTimestampDto.videoId,
            });
            await this.timestampListRepository.save(timestampList);
        }

        // 타임스탬프 생성
        const timestamp = this.timestampRepository.create({
            time: createTimestampDto.time,
            description: createTimestampDto.description,
            timestampList: timestampList,
        });

        return await this.timestampRepository.save(timestamp);
    }
}
