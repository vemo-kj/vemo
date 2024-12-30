'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './DropDownMenu.module.css';

export default function DropDownMenu() {
  const [drop, setDrop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = !!localStorage.getItem('token');
      setIsLoggedIn(loggedIn);
    }
  }, []);

  const toggleDropdown = () => {
    if (isLoggedIn) {
      setDrop((prev) => !prev);
    } else {
      router.push('/login');
    }
  };

  const closeDropdown = () => {
    setDrop(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    closeDropdown();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={styles.dropdown}>
      <button
        onClick={toggleDropdown}
        className={styles.dropbtn}
        aria-haspopup="true"
        aria-expanded={drop}
      >
        <img src="/icons/user.svg" alt="User Icon" />
      </button>
      {isLoggedIn && drop && (
        <div className={styles.dropdownContent}>
          <Link href="/mypage" className={styles.dropdownItem}>
            My Page
          </Link>
          <button className={styles.dropdownItem} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

