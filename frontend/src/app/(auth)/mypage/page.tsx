'use client'
//components
import Header from '../../components/Layout/Header'
import MyCard from "./components/mycard/MyCard"
import MyCardHeader from '../mypage/components/myCardHeader/MyCardHeader'
import MyProfile from './components/myProfile/myProfile'
import styles from './MyPage.module.css'
import Image from 'next/image'
export default function MyPage() {
  
  const myCardProps = {
    thumbnail: "썸네일",
    myCardTitle: "제목",
    cardMemoCount: 1,
    youtubeLink: "유튜브링크",


  };

  return (
    <>
    <Header />
    <div className={styles.pageContainer}>
      <div className={styles.banner}>
        <div className={styles.waveBg}></div>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImageWrapper}>
            <Image
              src="/images/example_userimage.svg" 
              alt="User Profile" 
              width={120} 
              height={120} 
              className={styles.profileImage}
              priority
            />
          </div>
          
          <MyProfile />
        </div>

        <div className={styles.contentSection}>
          <MyCardHeader />
          <div className={styles.cardGrid}>
            {[...Array(8)].map((_, index) => ( // 8개로 변경하여 2줄로 표시
              <MyCard
                key={index}
                thumbnail="/images/example_userimage.svg"
                myCardTitle="샘플 VEMO 제목"
                cardMemoCount={Math.floor(Math.random() * 10) + 1}
                youtubeLink="https://youtube.com/watch?v=sample"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

