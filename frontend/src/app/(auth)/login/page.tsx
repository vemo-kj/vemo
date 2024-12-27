// "use client"

// import styles from './Login.module.css';
// import Link from "next/link"
// import { useState } from "react"

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//   }

//   return(
//   <div className={styles.loginBox}>
//     <h1>로그인</h1>
//     <form onSubmit={handleSubmit}>
//     <div>
//       <label htmlFor="email">이메일</label>
//       <input
//         type="email"
//         id="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//     </div>
//     <div>
//       <label htmlFor="password">비밀번호</label>
//       <input
//         type="password"
//         id="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//     </div>
//     <button type="submit">로그인</button>
//   </form>
//   <p>
//     계정이 없으신가요? <Link href="/signup">회원가입</Link>
//   </p>
//   </div>
//   )
// }


"use client";

import styles from "./Login.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // 오류 메시지 상태
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // 기존 오류 초기화
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "로그인 실패");
      }
  
      const data = await response.json();
      console.log("로그인 성공:", data);
  
      // 로그인 성공 시 토큰 저장 및 리다이렉트
      localStorage.setItem("token", data.token); // 예시: 토큰 저장
      router.push("/"); // 홈 페이지로 이동
    } catch (err) {
      console.error("로그인 에러:", err);
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    }
  };
  return (
    <div className={styles.loginBox}>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      {error && <p className={styles.error}>{error}</p>} {/* 오류 메시지 표시 */}
      <p>
        계정이 없으신가요? <Link href="/signup">회원가입</Link>
      </p>
    </div>
  );
}