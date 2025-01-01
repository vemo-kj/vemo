import Link from 'next/link';
import Image from 'next/image';
import styles from './MainCard.module.css';
import { MainCardProps } from '../../types/MainCardProps';

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
        <Link href="/vemo/[youtubeLink]" as={`/vemo/${id}`}>
            <div className={styles.mainCard}>
                <div>
                    <img src={thumbnails} className={styles.thumbnails} />
                </div>
                <div>
                    <span className={styles.title}>{title}</span>
                    <div className={styles.channel}>
                        <img src={channelThumbnails} className={styles.channelThumbnails} />
                        <span className={styles.channelTitle}>{channelTitle}</span>
                    </div>
                    <span className={styles.vemoCount}>vemoCount: {vemoCount}</span>
                </div>
            </div>
        </Link>
    );
}
