import Link from 'next/link';
import styles from './MyCard.module.css';

interface PreviewVideo {
  id: string;
  title: string;
  channel: string;
}

interface MyCardProps {
  id: number;
  name: string;
  totalVideos: number;
  thumbnail: string;
  previewVideos: PreviewVideo[];
}

export default function MyCard({ id, name, totalVideos, thumbnail, previewVideos }: MyCardProps) {
  const hasMultipleVideos = totalVideos >= 2;
  const firstVideoId = previewVideos[0]?.id;

  return (
    <Link href={`/vemo/${firstVideoId}?playlistId=${id}`} className={styles.cardLink}>
      <div className={styles.myCard}>
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailStack}>
            {hasMultipleVideos ? (
              <>
                <img
                  src={thumbnail || '/images/default-thumbnail.jpg'}
                  alt={name}
                  className={`${styles.thumbnail} ${styles.thumbnailBack}`}
                />
                <img
                  src={thumbnail || '/images/default-thumbnail.jpg'}
                  alt={name}
                  className={`${styles.thumbnail} ${styles.thumbnailFront}`}
                />
              </>
            ) : (
              <img
                src={thumbnail || '/images/default-thumbnail.jpg'}
                alt={name}
                className={styles.thumbnail}
              />
            )}
          </div>
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.title}>{name}</h3>
          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>총 영상 수</span>
              <span className={styles.statValue}>{totalVideos}개</span>
            </div>
          </div>
          <div className={styles.previewVideos}>
            {previewVideos.slice(0, 2).map((video, index) => (
              <div key={video.id} className={styles.previewVideo}>
                {index + 1}. {video.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
