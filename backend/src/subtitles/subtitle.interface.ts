export interface Subtitle {
    startTime: string;
    endTime: string;
    text: string;
}

export interface SubtitleResponse {
    subtitles: Subtitle[];
    videoId: string;
}
