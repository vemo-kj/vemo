'use client'
// style
import styles from './SearchBox.module.css'
import Image from 'next/image'
// next
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setValue] = useState<string>(searchParams?.get('q') || '');

  const handleSearch = () => {
    const trimmedQuery = q.trim();
    if (trimmedQuery === '') {
      router.push('/');
    } else {
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
    }
    // setValue(''); // 검색 후 입력값 유지
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchBox}>
      <img
        src='/icons/search.svg'
        className={styles.searchIcon}
        alt="검색"
      />
      <input
        id="search-input"
        name="q"
        className={styles.searchbar}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        type="text"
        value={q}
        placeholder='검색어를 입력 해주세요...'
        aria-label="검색어 입력"
      />
      <button
        className={styles.searchButton}
        onClick={handleSearch}
        type="button"
        aria-label="검색하기"
      >
        검색
      </button>
    </div>
  )
}
