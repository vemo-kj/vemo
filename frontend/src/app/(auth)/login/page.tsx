"use client"

import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // 로그인 로직 구현
  }

  return(
  <div>
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
  <p>
    {/* 회원가입 페이지 작성 후 링크로 연결할것 */}
    계정이 없으신가요? <Link href="/signup">회원가입</Link>
  </p>
  </div>
  )
}