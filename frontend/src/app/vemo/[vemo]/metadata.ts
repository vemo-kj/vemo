import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { vemo: string } }): Promise<Metadata> {
  return {
    title: `Video Memo - ${params.vemo}`,
  };
} 