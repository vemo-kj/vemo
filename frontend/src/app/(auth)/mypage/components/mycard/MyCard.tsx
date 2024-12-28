// next
import Image from 'next/image'
import Link from 'next/link';
// components
import styles from './MyCard.module.css'
//types
import { MyCardProps } from '../../../../types/MyCardProps';

 

export default function MyCard({

  thumbnail,
  myCardTitle,
  // myCardTitle -> playListTitle 이 더 괜찮을듯
  cardMemoCount,
  youtubeLink,

}: MyCardProps) {
  return(
    // 카드 클릭시 해당youtubeLink를 가진 vemo페이지로 이동
    <Link href='/vemo/[id]' as={`/vemo/${youtubeLink}`}>
      <div className={styles.myCard}>
        <div className={styles.thumbnailContainer}>
          <Image 
            src={thumbnail} 
            alt={myCardTitle} 
            width={280} 
            height={157} 
            className={styles.thumbnail}
          />
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.title}>{myCardTitle}</h3>

          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: '75%' }}></div>
          </div>
          
          <span className={styles.progressText}>진행률 75% / 100</span>
        </div>

      </div>
      </Link>
  )
}

