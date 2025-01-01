"use client";

// component
import InputBox from './components/InputBox/InputBox';
import SignUpButton from './components/SignUpButton/SignUpButton';
import ProfileImage from './components/ProfileImage/ProfileImage';
import Header from '../.././components/Layout/Header'
// style
import styles from './SignUp.module.css';
// next
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  // 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    nickname: '',
    email: '',
    password: '',
    introduction:'',
    gender:'',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null); // 이미지 상태 관리
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

    if (!selectedImage) {
      setError('프로필 이미지를 선택하세요.');
      return;
    }

    try {
      // FormData로 데이터 생성
      const formDataObj = new FormData();
      formDataObj.append('profileImage', selectedImage);
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      const response = await fetch("http://192.168.1.122:5050/users/signup", {
        method: 'POST',
        credentials: 'include',
        body: formDataObj,
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
    <>
      <Header />
      <div className={styles.signUpBox}>
      <h1 className={styles.signUpTitle}>회원정보 입력</h1>
      <form onSubmit={handleSubmit}>
        <ProfileImage onImageSelect={(image) => setSelectedImage(image)} />
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
          id="birth"
          name="birth"
          required
          onChange={handleInputChange}
        />
        <InputBox
          label="성별"
          type="text"
          id="gender"
          name="gender"
          required
          onChange={handleInputChange}
          placeholder="Male, Female, Other 중 하나를 입력하세요."
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
          label="자기소개"
          type="text"
          id="introduction"
          name="introduction"
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
  </>
  );
}

