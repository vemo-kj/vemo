'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Community.module.css';

interface Memos {
    id: number;
    title: string;
    user: {
        id: number;
        nickname: string;
    };
    created_at: Date;
}

interface DetailedMemos {
    id: number;
    title: string;
    createdAt: Date;
    user: {
        id: number;
        nickname: string;
    };
    video: {
        id: string;
        title: string;
        channel: {
            name: string;
        };
    };
    memo: Array<{
        id: number;
        timestamp: string;
        description: string;
    }>;
    captures: Array<{
        id: number;
        timestamp: string;
        image: string;
    }>;
}

interface CommunityResponse {
    memos: Memos[];
}

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <p className={styles.modalMessage}>{message}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={styles.confirmButton}>
                        네
                    </button>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        아니요
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailView = ({
    memo,
    onBack,
    viewMode,
    onDelete,
}: {
    memo: DetailedMemos;
    onBack: () => void;
    viewMode: 'all' | 'mine';
    onDelete: (memoId: number) => Promise<void>;
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleShareClick = () => {
        setIsShareModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDelete(memo.id);
            onBack();
        } catch (error) {
            console.error('메모 삭제 실패:', error);
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleShareConfirm = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            // memo 객체 검증
            if (!memo || !memo.id || !memo.video || !memo.video.id) {
                console.error('메모 데이터 구조:', memo);
                throw new Error('잘못된 메모 데이터입니다.');
            }

            console.log('퍼가기 요청 전 memo:', memo);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/vemo/${memo.id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const responseData = await response.json();
            console.log('서버 응답:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || '메모 복사에 실패했습니다.');
            }

            if (!responseData || !responseData.id) {
                console.error('응답 데이터 구조:', responseData);
                throw new Error('서버 응답 데이터가 올바르지 않습니다.');
            }

            // 새로운 URL 생성 및 이동
            const newUrl = `/vemo/${memo.video.id}?memosId=${responseData.id}`;
            console.log('이동할 URL:', newUrl);
            window.location.href = newUrl;
        } catch (error) {
            console.error('메모 복사 실패:', error);
            setError(error instanceof Error ? error.message : '메모 복사에 실패했습니다.');
        } finally {
            setIsLoading(false);
            setIsShareModalOpen(false);
        }
    };

    const handleEditClick = () => {
        if (!memo || !memo.video || !memo.video.id) {
            console.error('메모 데이터가 올바르지 않습니다.');
            return;
        }

        // mode=edit 파라미터 추가
        window.location.href = `/vemo/${memo.video.id}?memosId=${memo.id}&mode=edit`;
    };

    if (!memo) {
        return (
            <div className={styles.detailView}>
                <div className={styles.detailHeader}>
                    <button className={styles.backButton} onClick={onBack}>
                        뒤로가기
                    </button>
                </div>
                <div className={styles.loading}>데이터를 불러오는 중...</div>
            </div>
        );
    }

    // 메모와 캡처 데이터를 시간 기준으로 정순 정렬
    const sortedMemos = memo.memo?.slice().sort((a, b) => {
        const timeA = a.timestamp.split(':').map(Number);
        const timeB = b.timestamp.split(':').map(Number);
        const secondsA = timeA[0] * 60 + timeA[1];
        const secondsB = timeB[0] * 60 + timeB[1];
        return secondsA - secondsB; // 정순 정렬
    });

    const sortedCaptures = memo.captures?.slice().sort((a, b) => {
        const timeA = a.timestamp.split(':').map(Number);
        const timeB = b.timestamp.split(':').map(Number);
        const secondsA = timeA[0] * 60 + timeA[1];
        const secondsB = timeB[0] * 60 + timeB[1];
        return secondsA - secondsB; // 정순 정렬
    });

    return (
        <div className={styles.detailView}>
            <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={onBack}>
                    뒤로가기
                </button>
                {viewMode === 'all' ? (
                    <button
                        className={styles.shareButton}
                        onClick={handleShareClick}
                        disabled={isLoading}
                    >
                        {isLoading ? '처리중...' : '퍼가기'}
                    </button>
                ) : (
                    <div className={styles.buttonGroup}>
                        <button className={styles.editButton} onClick={handleEditClick}>
                            작성하기
                        </button>
                        <button
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            disabled={isLoading}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.detailContent}>
                <h3 className={styles.detailTitle}>{memo.title}</h3>
                <div className={styles.detailInfo}>
                    <span className={styles.author}>{memo.user?.nickname || '사용자 없음'}</span>
                    <span className={styles.date}>
                        작성: {new Date(memo.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {sortedMemos?.length > 0 && (
                    <div className={styles.memoList}>
                        {sortedMemos.map(item => (
                            <div key={item.id} className={styles.memoItem}>
                                <span className={styles.timestamp}>{item.timestamp}</span>
                                <div
                                    className={styles.description}
                                    dangerouslySetInnerHTML={{
                                        __html: item.description || '',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {sortedCaptures?.length > 0 && (
                    <div className={styles.captureList}>
                        {sortedCaptures.map(capture => (
                            <div key={capture.id} className={styles.captureItem}>
                                <span className={styles.timestamp}>{capture.timestamp}</span>
                                <img
                                    src={capture.image}
                                    alt={`Capture at ${capture.timestamp}`}
                                    className={styles.captureImage}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                message="정말 삭제하시겠습니까?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            <ConfirmModal
                isOpen={isShareModalOpen}
                message="해당 메모를 기반으로 작성을 시작하시겠습니까?"
                onConfirm={handleShareConfirm}
                onCancel={() => setIsShareModalOpen(false)}
            />
        </div>
    );
};

export default function Community() {
    const [memos, setMemos] = useState<Memos[]>([]);
    const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
    const [selectedCard, setSelectedCard] = useState<DetailedMemos | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const getVideoIdFromURL = () => {
        try {
            const currentUrl = window.location.href;
            const url = new URL(currentUrl);
            const pathSegments = url.pathname.split('/');
            const videoId = pathSegments[pathSegments.length - 1];
            return videoId ? videoId.split('?')[0] : null;
        } catch (error) {
            console.error('URL 파싱 에러:', error);
            return null;
        }
    };

    const fetchMemos = async (filter: 'all' | 'mine' = 'all') => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const videoId = getVideoIdFromURL();

            if (!token || !videoId) {
                throw new Error('필요한 정보가 없습니다.');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/vemo/video/${videoId}/community?filter=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                },
            );

            if (!response.ok) {
                throw new Error('메모 목록을 불러오는데 실패했습니다.');
            }

            const data: CommunityResponse = await response.json();
            setMemos(data.memos);
        } catch (error) {
            console.error('메모 목록 조회 실패:', error);
            setError(
                error instanceof Error ? error.message : '메모 목록을 불러오는데 실패했습니다.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMemos(viewMode);
    }, [viewMode]);

    const handleViewModeChange = (mode: 'all' | 'mine') => {
        setSelectedCard(null);
        setViewMode(mode);
    };

    const handleCardSelect = async (memo: Memos) => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            // 현재 비디오 ID 가져오기
            const videoId = getVideoIdFromURL();
            if (!videoId) {
                throw new Error('비디오 ID를 찾을 수 없습니다.');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memos/${memo.id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();
            console.log('받은 상세 데이터:', data);

            if (!response.ok) {
                throw new Error(data.message || '메모 상세 정보를 불러오는데 실패했습니다.');
            }

            // video 정보 추가
            const enrichedData = {
                ...data,
                video: {
                    id: videoId,
                    title: '', // 필요한 경우 비디오 정보 API로 가져오기
                    channel: {
                        name: '',
                    },
                },
            };

            setSelectedCard(enrichedData);
        } catch (error) {
            console.error('메모 상세 조회 실패:', error);
            setError(error instanceof Error ? error.message : '메모를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMemo = async (memoId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memos/${memoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('메모 삭제에 실패했습니다.');
            }

            // 메모 목록 새로고침
            await fetchMemos(viewMode);
        } catch (error) {
            console.error('메모 삭제 실패:', error);
            setError(error instanceof Error ? error.message : '메모 삭제에 실패했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Community</h1>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'all' ? styles.active : ''}`}
                        onClick={() => handleViewModeChange('all')}
                    >
                        전체보기
                    </button>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'mine' ? styles.active : ''}`}
                        onClick={() => handleViewModeChange('mine')}
                    >
                        내글보기
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>로딩 중...</div>
            ) : !selectedCard ? (
                <div className={styles.memoList}>
                    {memos.length === 0 ? (
                        <div className={styles.noContent}>
                            {viewMode === 'all' ? '작성된 글이 없습니다.' : '작성한 글이 없습니다.'}
                        </div>
                    ) : (
                        memos.map(memo => (
                            <div
                                key={memo.id}
                                className={styles.memoCard}
                                onClick={() => handleCardSelect(memo)}
                            >
                                <div className={styles.memoContent}>
                                    <h3 className={styles.memoTitle}>{memo.title}</h3>
                                </div>
                                <div className={styles.memoInfo}>
                                    <span className={styles.author}>{memo.user.nickname}</span>
                                    <div className={styles.dateInfo}>
                                        <span className={styles.date}>
                                            작성: {new Date(memo.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <DetailView
                    memo={selectedCard}
                    onBack={() => setSelectedCard(null)}
                    viewMode={viewMode}
                    onDelete={handleDeleteMemo}
                />
            )}
        </div>
    );
}
