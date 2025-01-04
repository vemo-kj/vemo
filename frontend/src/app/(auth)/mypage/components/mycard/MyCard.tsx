
import Image from 'next/image'
import Link from 'next/link';
import styles from './MyCard.module.css'

interface MyCardProps {
  thumbnail: string;
  playlistTitle: string;  // myCardTitle을 playlistTitle로 변경
  totalVideos: number;    // 총 영상 개수 추가
  totalMemos: number;     // 작성된 메모 총 수 (기존 cardMemoCount를 더 명확한 이름으로)
  youtubeLink: string;
}

export default function MyCard({
  thumbnail,
  playlistTitle,
  totalVideos,
  totalMemos,
  youtubeLink,
}: MyCardProps) {
  return (
    <Link href='/vemo/[id]' as={`/vemo/${youtubeLink}`}>
      <div className={styles.myCard}>
        <div className={styles.thumbnailContainer}>
          <Image
            src={thumbnail}
            alt={playlistTitle}
            width={280}
            height={157}
            className={styles.thumbnail}
          />
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.title}>{playlistTitle}</h3>

          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>총 영상</span>
              <span className={styles.statValue}>{totalVideos}개</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>작성된 메모</span>
              <span className={styles.statValue}>{totalMemos}개</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
