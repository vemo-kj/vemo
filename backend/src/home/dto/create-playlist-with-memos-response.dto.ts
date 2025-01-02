export class CreatePlaylistWithMemosResponseDto {
    playlist: {
        id: number;
        name: string;
    };
    video: {
        id: string;
        title: string;
        thumbnails: string;
        channel: {
            id: string;
            thumbnails: string;
            title: string;
        };
        duration: string;
        category: string;
    };
    memos: {
        id: number;
        title: string;
        description: string;
    };
}
