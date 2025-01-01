'use client'
// style
import styles from './SearchBox.module.css'
import Image from 'next/image'
// next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  
  const [q, setValue] = useState<string>('');
  const router = useRouter();
  
  const handleSearch = () => {
    const trimmedQuery = q.trim();

    if (trimmedQuery === '') {
      router.push('/');
    } else {
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
    }
    setValue('');
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
          />
          <input 
            className={styles.searchbar}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            value={q}
            placeholder='검색어를 입력 해주세요...'
          />
          <button onClick={handleSearch}>검색</button>
    </div>
  )
}
