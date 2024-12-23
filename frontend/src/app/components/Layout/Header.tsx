import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.mainNav}>
      <div>
        {/* 링크로 main 가도록 연결할것 */}
        {/* span에서 이미지로 변경해야 할것 베모 로고 */}
        <span className={styles.buttonHome}>VEMO</span>
      </div>
      <div>
        {/* 검색아이콘 추가로 작성할것 -> 동적렌더링 되도록 따로 분리해서 작성해야할듯 */}
        <input className={styles.searchBar} type="text" placeholder='검색어를 입력하던가 말던가 해'/>
      </div>
      <div>
        {/* 링크로 묶어주기 - 마이페이지 */}
        <button className={styles.mainNavUser}>
          프로필
        </button>
        {/* 링그로 묶어주기 - create페이지 */}
        <button className={styles.mainNavCreate}>
          작성하기
        </button>
      </div>
    </header>
  )
}