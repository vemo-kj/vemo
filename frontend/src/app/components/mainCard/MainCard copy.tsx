import Link from "next/link"
import Image from "next/image";
import styles from './MainCard.module.css'
import { MainCardProps } from '../../types/MainCardProps';


export default function MainCard({
  id,
  title,
  thumbnails,
  duration,
  category,
  channel:{
    id: channelId,
    thumbnails: channelThumbnails,
    title: channelTitle,
  },
  vemoCount,
}: MainCardProps) {

  return(
    // 썸네일, 유튜버로고 {}형태 추가
    <Link href='/vemo/[youtubeLink]' as={`/vemo/${pEt89CrE-6A}`}>
      <div className={styles.mainCard}>
        <div>
          <img src={thumbnails} className={styles.youtubeImage} />
        </div>
        <div>
          <span className={styles.thumbnail}>TITLE:{title}</span>
          <div>
            <img src={channelThumbnails} className={styles.youtuberLogo} />
            <span className={styles.youtuberProfile}>유튜브채널명{channelTitle}</span>
          </div>
          <span className={styles.cardMemoCount}>vemo의 수{vemoCount}</span>
        </div>
      </div>
    </Link>
  )
}

