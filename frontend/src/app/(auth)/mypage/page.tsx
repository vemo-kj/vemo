import MyCard from "./components/mycard/MyCard"
import styles from './MyPage.module.css'
import Image from "next/image";


export default function MyPage() {

  const myCardProps = {
    thumbnail: "우선은 썸네일",
    mainCardTitle: "제목이",
    cardMemoCount: 1,
  };

  return(


    <div className={styles.myPageContainer}>
      <div>
        <div className={styles.myProfileImage}>
          {/* 예시 이미지 적용 */}
          <img src="/images/example_userimage.svg" />
        </div>
        
        <div className={styles.myProfileContainer}>
          <h1>Malsook Kim</h1>
          <button>Edit Profile</button>
          <span>안녕하세요. 저는 서성진입니다. 잘부탁드려요</span>
        </div>
      </div>
      


      <div>
        <div className={styles.myCardContentContainer}>
          <div>
            <h2>나의 Vemo 모아보기</h2>
            <span>총 00개</span>
          </div>
          <div>
            {/* 리액트 컴포넌트 토글로 교체하면 좋을듯 */}
            <button>진행중</button>
            <button>내 메모 보기</button>
          </div>
        </div>
        <div className={styles.myCardContainer}>
          <MyCard myCardProps={myCardProps} />
        </div>
      </div>
    </div>
  )
}