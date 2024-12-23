import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('초안')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}
}
