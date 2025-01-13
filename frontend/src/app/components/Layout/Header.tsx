// next
import Link from 'next/link';
// style
import styles from './Header.module.css';
//component
import SearchBox from './SearchBox';
import DropDownMenu from './DropDownMenu';

export default function Header() {
  return (
    <header className={styles.mainNav}>

      <div>
        <Link href="/" className={styles.buttonHome}>
          <img
            src="/icons/Button_home_.svg"
            alt='home'
          />
        </Link>
      </div>

      <div>
        <SearchBox />
      </div>

      <div className={styles.mainNavButton}>
        <div className={styles.mainNavUser}>
          <DropDownMenu />
        </div>
        <div>
          <Link href="/create" className={styles.mainNavCreate}>
            작성하기
          </Link>
        </div>
      </div>
    </header>
  )
}

