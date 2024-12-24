import { Injectable } from '@nestjs/common';

@Injectable()
export class TimestampService {
    getCurrentTimestamp() {
        return { timestamp: new Date().toISOString() };
    }
}
