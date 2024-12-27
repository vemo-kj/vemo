// 'use client';
// // style
// import Image from "next/image";
// import styles from './DropDownMenu.module.css';
// //next
// import Link from "next/link";
// import { useState } from "react";

// export default function DropDownMenu() {
//   const [drop, setDrop] = useState(false);

//   const toggleDropdown = () => {
//     setDrop(!drop);
//   };
//   const closeDropdown = () => {
//     setDrop(false);
//   };

//   return (
//     <div className={styles.dropdown}>
//       <button onClick={toggleDropdown} className={styles.dropbtn}>
//         <img src='/icons/user.svg' alt="User Icon" />
//       </button>

//       {drop && (
//         <div className={styles.dropdownContent}>
//           <Link href="/mypage" className={styles.dropdownItem} onClick={closeDropdown}>
//             My Page
//           </Link>

//           <button
//             className={styles.dropdownItem}
//             onClick={() => {
//               alert('로그아웃');
//               closeDropdown();
//               // 로그아웃 로직 추가
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';
// style
import styles from './DropDownMenu.module.css';
// next
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DropDownMenu() {
  const [drop, setDrop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('token');
    setIsLoggedIn(loggedIn);
  }, []);

  const toggleDropdown = () => {
    if (isLoggedIn) {
      setDrop(!drop);
    } else {
      router.push('/login');
    }
  };

  const closeDropdown = () => {
    setDrop(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
    setIsLoggedIn(false); 
    closeDropdown();
    router.push('/login');
  };

  return (
    <div className={styles.dropdown}>
      <button onClick={toggleDropdown} className={styles.dropbtn}>
        <img src="/icons/user.svg" alt="User Icon" />
      </button>

      {isLoggedIn && drop && (
        <div className={styles.dropdownContent}>
          <Link
            href="/mypage"
            className={styles.dropdownItem}
            onClick={closeDropdown}
          >
            My Page
          </Link>
          <button
            className={styles.dropdownItem}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}