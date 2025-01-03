// 재생목록 가져 오기 vemo_editor header에서 사용
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { vemo: string } }): Promise<Metadata> {
  return {
    title: `Video Memo - ${params.vemo}`,
  };
} 