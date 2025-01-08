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
        <Link href={`/vemo/${id}`} className={styles.cardLink}>
            <div className={styles.mainCard}>
                <div className={styles.thumbnailContainer}>
                    <img src={thumbnails} className={styles.thumbnails} alt={title} />
                </div>
                <div className={styles.contentContainer}>
                    <h3 className={styles.title}>{title}</h3>
                    <div className={styles.channelInfo}>
                        <img 
                            src={channelThumbnails} 
                            className={styles.channelThumbnails} 
                            alt={channelTitle} 
                        />
                        <span className={styles.channelTitle}>{channelTitle}</span>
                    </div>
                    <span className={styles.vemoCount}>베모 {vemoCount}개</span>
                </div>
            </div>
        </Link>
    );
}
