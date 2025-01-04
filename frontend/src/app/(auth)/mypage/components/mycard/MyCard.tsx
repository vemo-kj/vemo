import Image from 'next/image'
import Link from 'next/link';
import styles from './MyCard.module.css'

interface MyCardProps {
  id: number;
  name: string;
  totalVideos: number;
  thumbnail: string;
  previewVideos: Array<{
    id: string;
    title: string;
    channel: string;
  }>;
}

export default function MyCard({ id, name, totalVideos, thumbnail, previewVideos }: MyCardProps) {
  return (
    <Link href={`/vemo/${previewVideos[0]?.id}?playlistId=${id}`} className={styles.cardLink}>
      <div className={styles.myCard}>
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailStack}>
            {previewVideos.slice(0, 3).map((video, index) => (
              <img
                key={video.id}
                src={thumbnail || '/default-thumbnail.jpg'}
                alt={name}
                className={styles.thumbnail}
              />
            ))}
          </div>
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.title}>{name}</h3>
          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>총 영상</span>
              <span className={styles.statValue}>{totalVideos}개</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
