export class ChannelDto {
    title: string;
    thumbnails: string;
}

export class VideoDto {
    id: string;
    title: string;
    thumbnails: string;
    duration: string;
    channel: ChannelDto;
}

export class PlaylistResponseDto {
    id: number;
    name: string;
    userId: number;
    videos: VideoDto[];
}
