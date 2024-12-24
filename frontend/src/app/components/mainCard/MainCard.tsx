import Link from "next/link"
import Image from "next/image";
import styles from './MainCard.module.css'
import { MainCardProps } from '../../types/MainCardProps';


export default function MainCard({
  thumbnail,
  mainCardTitle,
  youtuberLogo,
  youtuberProfile,
  cardMemoCount,
  category,
  youtubeLink,

}: MainCardProps) {

  return(
    // 썸네일, 유튜버로고 {}형태 추가
    <Link href='/vemo'>
      <div className={styles.mainCard}>
        <div>
          <img src="/images/example.svg" className={styles.youtubeImage} />
        </div>
        <div>
          <span className={styles.thumbnail}>TITLE:{mainCardTitle}</span>
          <div>
            <img src="/images/example2.svg" className={styles.youtuberLogo} />
            <span className={styles.youtuberProfile}>유튜브채널명{youtuberProfile}</span>
          </div>
          <span className={styles.cardMemoCount}>vemo의 수{cardMemoCount}</span>
        </div>
      </div>
    </Link>
  )
}