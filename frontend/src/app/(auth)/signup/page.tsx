// // component
// import InputBox from './components/InputBox/InputBox'
// import SignUpButton from './components/SignUpButton/SignUpButton'
// import ProfileImage from './components/ProfileImage/ProfileImage'
// // type
// import { InputBoxProps } from '@/app/types/InputBoxProps'
// // style
// import styles from './SignUp.module.css'
// import Link from 'next/link'



// export default function SignUpPage() {
//   return(
//     <div className={styles.signUpBox}>
//       <h1 className={styles.signUpTitle}>회원정보 입력</h1>
//       <form>

//         <ProfileImage 
//           id=''
//           />
//           {/* 오류해결해야함 */}
//           {/* accept=''/> */}
        
//         <InputBox
//           label='이름'
//           type='text'
//           id='name'
//           name='userName'
//           required
//           />
//         <InputBox
//           label='생년월일'
//           type='date'
//           id='date'
//           name='userDate'
//           required
//           />
//         <InputBox
//           label='닉네임'
//           type='text'
//           id='nickname'
//           name='userNickname'
//           required
//           />
//         <InputBox
//           label='이메일(아이디)'
//           type='email'
//           id='email'
//           name='userEmail'
//           required
//           />
//         <InputBox
//           label='비밀번호'
//           type='password'
//           id='password'
//           name='userPassword'
//           required
//           />
//         <InputBox
//           label='비밀번호 확인'
//           type='password'
//           id='passwordCheck'
//           name='userPasswordCheck'
//           required
//           />
//       </form>
      
//       <div>
//         <SignUpButton />
//       </div>
      
//       <p className={styles.sign}>
//         이미 계정이 있으신가요?
//         <Link 
//           className={styles.signUpLoginLink}
//           href="/login">로그인</Link>
//       </p>
//     </div>
//   )
// }


"use client";

// component
import InputBox from './components/InputBox/InputBox';
import SignUpButton from './components/SignUpButton/SignUpButton';
import ProfileImage from './components/ProfileImage/ProfileImage';
// style
import styles from './SignUp.module.css';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  
  // 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    nickname: '',
    email: '',
    password: '',
    passwordCheck: '',
  });
  const [error, setError] = useState<string | null>(null);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 간단한 유효성 검사
    if (formData.password !== formData.passwordCheck) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입 실패');
      }

      const data = await response.json();
      console.log('회원가입 성공:', data);

      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.signUpBox}>
      <h1 className={styles.signUpTitle}>회원정보 입력</h1>
      <form onSubmit={handleSubmit}>
        <ProfileImage id="" />
        <InputBox
          label="이름"
          type="text"
          id="name"
          name="name"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="생년월일"
          type="date"
          id="date"
          name="date"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="닉네임"
          type="text"
          id="nickname"
          name="nickname"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="이메일(아이디)"
          type="email"
          id="email"
          name="email"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="비밀번호"
          type="password"
          id="password"
          name="password"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="비밀번호 확인"
          type="password"
          id="passwordCheck"
          name="passwordCheck"
          required
          onChange={handleInputChange}
        />
        <SignUpButton />
      </form>

      {error && <p className={styles.error}>{error}</p>} {/* 오류 메시지 표시 */}

      <p className={styles.sign}>
        이미 계정이 있으신가요?{' '}
        <Link className={styles.signUpLoginLink} href="/login">
          로그인
        </Link>
      </p>
    </div>
  );
}