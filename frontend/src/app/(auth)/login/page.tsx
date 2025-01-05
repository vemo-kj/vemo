'use client';
// style
import styles from './Login.module.css';
// next
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// components
import Header from '@/app/components/Layout/Header';
import LoginInputBox from './components/LoginInputBox';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('http://localhost:5050/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('서버 에러 데이터:', errorData);
                throw new Error(errorData?.message || '로그인 실패');
            }

            const data = await response.json();
            console.log('로그인 성공 데이터:', data);

            // 데이터 구조 확인
            if (!data.access_token) {
                console.error('토큰 없음: 응답 데이터', data);
                setError('토큰을 받을 수 없습니다.');
                return;
            }

            // 토큰 저장
            sessionStorage.setItem('token', data.access_token);

            router.push('/');
        } catch (err) {
            console.error('로그인 에러:', err);
            setError(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
        }
    };
    return (
        <div>
            <Header />
            <div className={styles.loginBox}>
                <h1>로그인</h1>
                <form onSubmit={handleSubmit}>
                    <LoginInputBox
                        label="이메일"
                        type="email"
                        id="email"
                        name="name"
                        required={true}
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                    />
                    <div>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">로그인</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
                <p>
                    계정이 없으신가요? <Link href="/signup">회원가입</Link>
                </p>
            </div>
        </div>
    );
}