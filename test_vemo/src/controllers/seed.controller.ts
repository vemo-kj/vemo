import { Controller, Post, Logger } from '@nestjs/common';
import { SeedService } from '../services/seed.service';

@Controller('seed')
export class SeedController {
  private readonly logger = new Logger(SeedController.name);
  
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedData() {
    try {
      this.logger.log('시드 데이터 생성 시작');
      const result = await this.seedService.seed();
      this.logger.log('시드 데이터 생성 완료');
      return result;
    } catch (error) {
      this.logger.error('시드 데이터 생성 실패:', error);
      throw error;
    }
  }
} 