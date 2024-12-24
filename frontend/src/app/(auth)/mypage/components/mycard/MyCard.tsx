import styles from './MyCard.module.css'

type myCardProps = {
  thumbnail: string;
  mainCardTitle: string;
  cardMemoCount: number;
}

export default function MyCard({
  thumbnail,
  mainCardTitle,
  cardMemoCount
}: myCardProps) {

  return(
    <div className={styles.myCard}>
      <div>
        <img src="/images/example.svg" className={styles.myCardYoutubeImage} />
      </div>
      <div>
        <span className={styles.myCardtitle}>썸네일이 들어옵니다.</span>
      </div>
      <span className={styles.myCardMemoCount}>vemo의 수</span>
    </div>
  )
}