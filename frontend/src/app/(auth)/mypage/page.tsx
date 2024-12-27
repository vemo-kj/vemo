// import MyCard from "./components/mycard/MyCard"
// import styles from './MyPage.module.css'
// import Image from "next/image";


// export default function MyPage() {

//   const myCardProps = {
//     thumbnail: "우선은 썸네일",
//     mainCardTitle: "제목이",
//     cardMemoCount: 1,
//   };

//   return(


//     <div className={styles.myPageContainer}>
//       <div>
//         <div className={styles.myProfileImage}>
//           {/* 예시 이미지 적용 */}
//           <img src="/images/example_userimage.svg" />
//         </div>
        
//         <div className={styles.myProfileContainer}>
//           <h1>Malsook Kim</h1>
//           <button>Edit Profile</button>
//           <span>안녕하세요. 저는 서성진입니다. 잘부탁드려요</span>
//         </div>
//       </div>
      


//       <div>
//         <div className={styles.myCardContentContainer}>
//           <div>
//             <h2>나의 Vemo 모아보기</h2>
//             <span>총 00개</span>
//           </div>
//           <div>
//             {/* 리액트 컴포넌트 토글로 교체하면 좋을듯 */}
//             <button>진행중</button>
//             <button>내 메모 보기</button>
//           </div>
//         </div>
//         <div className={styles.myCardContainer}>
//           <MyCard />
//         </div>
//       </div>
//     </div>
//   )
// }

import MyCard from "./components/mycard/MyCard"
import styles from './MyPage.module.css'
import Image from "next/image";

export default function MyPage() {

  const myCardProps = {
    thumbnail: "/placeholder.svg?height=150&width=200",
    mainCardTitle: "React 입문자들의 알아야 할 Redux 참개념명 (8분정)",
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
          
          <div className={styles.profileInfo}>
            <div className={styles.nameSection}>
              <h1>malsook._.KIM</h1>
              <button className={styles.editButton}>Edit Profile</button>
            </div>
            <p className={styles.bio}> 
              안녕하세요. 저는 서성진입니다. 잘부탁드려ㅇㅅ
            </p>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <h2>나의 베모 모아보기</h2>
              <span>총 8개</span>
            </div>
            <div className={styles.viewControls}>
              <button className={styles.viewButton}>All</button>
              <button className={styles.viewButton}>studying</button>
            </div>
          </div>
          
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

