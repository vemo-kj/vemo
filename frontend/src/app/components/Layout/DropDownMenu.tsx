'use client';
// style
import Image from "next/image";
import styles from './DropDownMenu.module.css';
//next
import Link from "next/link";
import { useState } from "react";

export default function DropDownMenu() {
  const [drop, setDrop] = useState(false);

  const toggleDropdown = () => {
    setDrop(!drop);
  };
  const closeDropdown = () => {
    setDrop(false);
  };

  return (
    <div className={styles.dropdown}>
      <button onClick={toggleDropdown} className={styles.dropbtn}>
        <img src='/icons/user.svg' alt="User Icon" />
      </button>

      {drop && (
        <div className={styles.dropdownContent}>
          <Link href="/mypage" className={styles.dropdownItem} onClick={closeDropdown}>
            My Page
          </Link>

          <button
            className={styles.dropdownItem}
            onClick={() => {
              alert('로그아웃');
              closeDropdown();
              // 로그아웃 로직 추가
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}