export class ChannelDto {
    id: string;
    title: string;
    thumbnails: string;
}

export class VideoDto {
    id: string;
    title: string;
    thumbnails: string;
    duration: string;
    channel: ChannelDto;
    category: string;
}

export class PlaylistResponseDto {
    id: number;
    name: string;
    userId: number;
    videos: VideoDto[];
}
