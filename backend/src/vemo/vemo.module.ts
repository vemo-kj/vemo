import { Module } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { VemoController } from './vemo.controller';

@Module({
  controllers: [VemoController],
  providers: [VemoService],
})
export class VemoModule {}
