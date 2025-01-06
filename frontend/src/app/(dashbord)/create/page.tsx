'use client';

import Header from '@/app/components/Layout/Header';
import { VideoResponse } from '@/app/types/VideoResponse';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateButton from './components/createButton/CreateButton';
import InputLink from './components/inputLink/InputLink';
import InputTitle from './components/inputTitle/InputTitle';
import style from './Create.module.css';

export default function CreatePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [links, setLinks] = useState<string[]>(['']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
        }
    }, [router]);

    const extractVideoId = (url: string) => {
        try {
            const parsedUrl = new URL(url);
            const videoId = parsedUrl.searchParams.get('v');
            return videoId && videoId.length === 11 ? videoId : null;
        } catch {
            return null;
        }
    };

    const handleSave = async () => {
        setError(null);

        if (!name.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (links.some(link => link.trim() === '')) {
            alert('모든 링크를 입력해주세요.');
            return;
        }

        const videoIds = links.map(link => extractVideoId(link)).filter(id => id !== null);

    if (videoIds.length !== links.length) {
      alert('유효한 YouTube Video ID를 입력해주세요.');
      return;
    }

        const data = { name, videoIds };

        try {
            setIsLoading(true);
            console.log('전송하는 데이터:', data);

            const response = await fetch('http://localhost:5050/home/memos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData: VideoResponse = await response.json();
                console.log('백엔드 응답:', responseData);

                // 백엔드 응답 데이터로 URL 생성 및 이동
                const url = `/vemo/${responseData.videoId}?playlistId=${responseData.playlistId}&index=${responseData.videoIndex}`;
                console.log('이동할 URL:', url);

                setName('');
                setLinks(['']);
                router.push(url);
            } else {
                const errorData = await response.json();
                if (response.status === 401) {
                    alert('로그인이 만료되었습니다. 다시 로그인하세요.');
                    sessionStorage.removeItem('token');
                    router.push('/login');
                } else {
                    alert(`저장 실패: ${errorData.message}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...links];
        updatedLinks[index] = value;
        setLinks(updatedLinks);
    };

    return (
        <>
            <Header />
            <div className={style.createPage}>
                <h1>메모 작성하기</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <InputTitle onChange={e => setName(e.target.value)} />
                <InputLink
                    links={links}
                    onChange={handleLinkChange}
                    onAdd={() => setLinks([...links, ''])}
                />
                <CreateButton onSave={handleSave} isLoading={isLoading} />
            </div>
        </>
    );
}
