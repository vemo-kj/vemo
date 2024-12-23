import Link from "next/link"
import styles from './MainCard.module.css'

type mainCardProps = {
  thumbnail: string;
  mainCardTitle: string;
  youtuberLogo: string;
  youtuberProfile: string;
  cardMemoCount: number;
}

export default function MainCard({
  thumbnail,
  mainCardTitle,
  youtuberLogo,
  youtuberProfile,
  cardMemoCount
}: mainCardProps) {

  return(
    // 링크로 처리해야함
    <div className={styles.mainCard}>
      <div>
        <image className={styles.youtubeImage} />
      </div>
      <div>
        <span className={styles.thumbnail}>썸네일이 들어옵니다.</span>
        <div>
          <image className={styles.youtuberLogo} />
          <span className={styles.youtuberProfile}>유튜브채널명</span>
        </div>
        <span className={styles.cardMemoCount}>vemo의 수</span>
      </div>
    </div>
  )
}