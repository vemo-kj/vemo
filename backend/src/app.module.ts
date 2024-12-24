import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimestampModule } from './timestamp/timestamp.module';
import { EntityModule } from './entity/entity.module';

@Module({
    imports: [TimestampModule, EntityModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
