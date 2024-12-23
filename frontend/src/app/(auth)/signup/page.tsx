import styles from './SignUp.module.css'
import Link from 'next/link'

export default function SingUpPage() {
  return(
    <div>
      <h1>회원가입</h1>
      <form>
        <div>
          <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              required
            />
    </div>
    <div>
      <label htmlFor="birthdate">생년월일</label>
      <input
        type="date"
        id="birthdate"
        name="birthdate"
        required
      />
    </div>
    <div>
      <label htmlFor="gender">성별</label>
      <select
        id="gender"
        name="gender"
        required
      >
        <option value="">선택하세요</option>
        <option value="male">남성</option>
        <option value="female">여성</option>
        <option value="other">기타</option>
      </select>
    </div>
    <div>
      <label htmlFor="nickname">닉네임</label>
      <input
        type="text"
        id="nickname"
        name="nickname"
        required
      />
    </div>
    <div>
      <label htmlFor="email">이메일 (아이디)</label>
      <input
        type="email"
        id="email"
        name="email"
        required
      />
    </div>
    <div>
      <label htmlFor="password">비밀번호</label>
      <input
        type="password"
        id="password"
        name="password"
        required
      />
    </div>
    <div>
      <label htmlFor="confirmPassword">비밀번호 확인</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        required
      />
    </div>
    <div>
      <label htmlFor="bio">자기소개</label>
      <textarea
        id="bio"
        name="bio"
      />
    </div>
    <div>
      <label htmlFor="profilePicture">프로필 사진</label>
      <input
        type="file"
        id="profilePicture"
        name="profilePicture"
        accept="image/*"
      />
    </div>
    <button type="submit">회원가입</button>
  </form>
  <p>
    이미 계정이 있으신가요? <Link href="/login">로그인</Link>
  </p>
</div>
  )
}