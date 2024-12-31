import { Video } from '../../video/video.entity';
import { Memos } from '../../memos/memos.entity';

export class CreateMemosResponseDto {
    video: Video;
    memos: Memos;
}
