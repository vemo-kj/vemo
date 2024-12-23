import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';

export default function Header() {
  return (
    <header className={styles.mainNav}>
      <div>
        {/* 링크로 main 가도록 연결할것 */}
        <button className={styles.buttonHome}>
          <img src="/icons/Button_home.svg" />
        </button>
      </div>
      <div>
        {/* 검색아이콘 추가로 작성할것 -> 동적렌더링 되도록 따로 분리해서 작성해야할듯 */}
        <input className={styles.searchBar} type="text" placeholder='검색어를 입력 해주세요...'/>
      </div>
      <div>
        {/* 링크로 묶어주기 - 마이페이지 */}
        <button className={styles.mainNavUser}>
          <img src='/icons/user.svg'/>
        </button>
        {/* 링그로 묶어주기 - create페이지 */}
        <button className={styles.mainNavCreate}>
          작성하기
        </button>
      </div>
    </header>
  )
}