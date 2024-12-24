import { Test, TestingModule } from '@nestjs/testing';
import { TimestampController } from './timestamp.controller';

describe('TimestampController', () => {
    let controller: TimestampController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TimestampController],
        }).compile();

        controller = module.get<TimestampController>(TimestampController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
