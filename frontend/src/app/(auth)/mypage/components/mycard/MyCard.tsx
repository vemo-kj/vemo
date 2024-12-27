// import styles from './MyCard.module.css'

// type myCardProps = {
//   thumbnail: string;
//   mainCardTitle: string;
//   cardMemoCount: number;
// }

// export default function MyCard({
//   thumbnail,
//   mainCardTitle,
//   cardMemoCount
// }: myCardProps) {

//   return(
//     <div className={styles.myCard}>
//       <div>
//         <img src="/images/example.svg" className={styles.myCardYoutubeImage} />
//       </div>
//       <div>
//         <span className={styles.myCardtitle}>썸네일이 들어옵니다.</span>
//       </div>
//       <span className={styles.myCardMemoCount}>vemo의 수</span>
//     </div>
//   )
// }

import Link from 'next/link';
import styles from './MyCard.module.css'
import Image from 'next/image'

type MyCardProps = {
  thumbnail: string;
  mainCardTitle: string;
  cardMemoCount: number;
  youtubeLink: string;
}

export default function MyCard({

  thumbnail,
  mainCardTitle,
  cardMemoCount,
  youtubeLink

}: MyCardProps) {
  return(
    // 카드 클릭시 해당youtubeLink를 가진 vemo페이지로 이동
    <Link href='/vemo/[id]' as={`/vemo/${youtubeLink}`}>
      <div className={styles.myCard}>
        <div className={styles.thumbnailContainer}>
          <Image 
            src={thumbnail} 
            alt={mainCardTitle} 
            width={280} 
            height={157} 
            className={styles.thumbnail}
          />
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.title}>{mainCardTitle}</h3>

          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: '75%' }}></div>
          </div>
          
          <span className={styles.progressText}>진행률 75% / 100</span>
        </div>

      </div>
      </Link>
  )
}

