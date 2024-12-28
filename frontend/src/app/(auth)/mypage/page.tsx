//components
import MyCard from "./components/mycard/MyCard"
import MyCardHeader from '../mypage/components/myCardHeader/MyCardHeader'
import MyProfile from './components/myProfile/myProfile'
import styles from './MyPage.module.css'
import Image from "next/image";

export default function MyPage() {
  // 예시
  const myCardProps = {
    thumbnail: "/placeholder.svg?height=150&width=200",
    myCardTitle: "React 입문자들의 알아야 할 Redux 참개념명 (8분정)",
    cardMemoCount: 1,
    youtubeLink: "https://www.youtube.com/watch?v=CVpUuw9",


  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.banner}>
        <div className={styles.waveBg}></div>
        <button className={styles.changeCover}>Change cover</button>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImageWrapper}>
            <Image 
              src="/placeholder.svg?height=120&width=120" 
              alt="User Profile" 
              width={120} 
              height={120} 
              className={styles.profileImage}
            />
          </div>
          
          <MyProfile />
        </div>

        <div className={styles.contentSection}>
          <MyCardHeader />
          
          <div className={styles.cardGrid}>
            {[...Array(4)].map((_, index) => (
              <MyCard key={index} {...myCardProps} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

