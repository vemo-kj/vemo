'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5050/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // 쿠키를 받기 위해 추가
            });

            const data = await response.json();
            console.log('=== Login Response ===');
            console.log('Status:', response.status);
            console.log('Data:', data);

            if (response.ok) {
                // 토큰이 응답에 포함되어 있는지 확인
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    console.log('Token saved:', data.token);
                } else if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    console.log('Access token saved:', data.accessToken);
                }

                // 저장된 토큰 확인
                const savedToken = localStorage.getItem('token');
                console.log('Saved token verification:', savedToken);

                router.push('/home');
            } else {
                console.error('Login failed:', data.message);
                alert('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };

    // ... 나머지 JSX 코드 ...
}
