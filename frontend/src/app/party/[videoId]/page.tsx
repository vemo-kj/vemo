'use client';

import { useParams } from 'next/navigation';
import VideoPlayer from '../components/videoPlayer/VideoPlayer';

export default function PartyPage() {
    const params = useParams();
    const videoId = params.videoId as string;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">파티 룸</h1>
            {videoId && <VideoPlayer videoId={videoId} />}
        </div>
    );
}
