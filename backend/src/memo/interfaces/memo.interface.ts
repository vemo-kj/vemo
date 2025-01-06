// memo/interface/memo.interface.ts

export interface CreateMemoData {
    timestamp: Date; // 변환된 Date 객체
    description?: string;
    memosId: number;
}
