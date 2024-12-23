import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Video } from '../entities/video.entity';
import { Playlist } from '../entities/playlist.entity';
import { Memo } from '../entities/memo.entity';
import { TimestampList } from '../entities/timestamp-list.entity';
import { Timestamp } from '../entities/timestamp.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Memo)
    private memoRepository: Repository<Memo>,
    @InjectRepository(TimestampList)
    private timestampListRepository: Repository<TimestampList>,
    @InjectRepository(Timestamp)
    private timestampRepository: Repository<Timestamp>,
  ) {}

  async seed() {
    try {
      this.logger.log('유저 생성 시작');
      const user = await this.userRepository.save({
        name: '김테스트',
        email: 'test@example.com',
        password: 'password123',
        birth: new Date('1990-01-01'),
        gender: 'male',
        nickname: '테스트닉네임',
        profile_image: 'https://example.com/profile.jpg',
        introduction: '안녕하세요 테스트 계정입니다',
      });
      this.logger.log('유저 생성 완료:', user);

      this.logger.log('비디오 생성 시작');
      const video = await this.videoRepository.save({
        id: 'video123',
        title: '테스트 비디오',
        thumbnail: 'https://example.com/thumbnail.jpg',
        channel_image: 'https://example.com/channel.jpg',
        channel_name: '테스트 채널',
        runtime: new Date('1970-01-01T00:10:30'),
        category: '교육',
      });
      this.logger.log('비디오 생성 완료:', video);

      // 플레이리스트 생성
      const playlist = await this.playlistRepository.save({
        name: '나의 첫 플레이리스트',
        user: user,
      });

      // 메모 생성
      const memo = await this.memoRepository.save({
        title: '첫 메모',
        description: '이 부분이 중요합니다',
        author: '테스트작성자',
        user: user,
        video: video,
      });

      // 타임스탬프 리스트 생성
      const timestampList = await this.timestampListRepository.save({
        video: video,
      });

      // 타임스탬프 생성
      const timestamp = await this.timestampRepository.save({
        time: new Date('1970-01-01T00:01:30'),
        description: '중요한 부분 1',
        timestampList: timestampList,
      });

      return {
        message: '테스트 데이터가 성공적으로 생성되었습니다.',
        data: {
          user,
          video,
          playlist,
          memo,
          timestampList,
          timestamp,
        },
      };
    } catch (error) {
      this.logger.error('시드 데이터 생성 중 에러 발생:', error);
      throw error;
    }
  }
} 