export class PlaylistListResponseDto {
    id: number;
    name: string;
    totalVideos: number;
    thumbnail: string;
    previewVideos: {
        id: string;
        title: string;
        channel: string;
    }[];
}
