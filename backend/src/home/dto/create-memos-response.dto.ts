interface Memo {
    id: number;
    content: string;
    timestamp: Date;
    memosId: number;
}

interface Capture {
    id: number;
    imageUrl: string;
    timestamp: Date;
    memosId: number;
}

export class CreateMemosResponseDto {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Capture[];
}
