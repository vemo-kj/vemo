import Link from 'next/link';
import { MainCardProps } from '../../types/MainCardProps';
import styles from './MainCard.module.css';

export default function MainCard({
    id,
    title,
    thumbnails,
    duration,
    category,
    channel: { id: channelId, thumbnails: channelThumbnails, title: channelTitle },
    vemoCount,
}: MainCardProps) {
    return (
        // 썸네일, 유튜버로고 {}형태 추가
        <Link href={`/vemo/${id}`}>
            <div className={styles.mainCard}>
                <div>
                    <img src={thumbnails} className={styles.thumbnails} />
                </div>
                <div>
                    <span className={styles.title}>{title}</span>
                    <div>
                        <img src={channelThumbnails} className={styles.channelThumbnails} />
                        <span className={styles.channelTitle}>유튜브채널명{channelTitle}</span>
                    </div>
                    <span className={styles.vemoCount}>{vemoCount}</span>
                </div>
            </div>
        </Link>
    );
}
