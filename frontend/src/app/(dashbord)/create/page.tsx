// 'use client';
// // components
// import Header from '@/app/components/Layout/Header';
// import InputLink from './components/inputLink/InputLink';
// import InputTitle from './components/inputTitle/InputTitle';
// import CreateButton from './components/createButton/CreateButton';
// // style
// import style from './Create.module.css';
// // next
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function CreatePage() {
//   const router = useRouter();

//   // 상태 관리
//   const [title, setTitle] = useState('');
//   const [links, setLinks] = useState<string[]>(['']);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // URL 유효성 검사 함수
//   const isValidUrl = (url: string) => {
//     try {
//       new URL(url);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   // YouTube Video ID 추출 함수
//   const extractVideoId = (url: string) => {
//     try {
//       const parsedUrl = new URL(url);
//       const videoId = parsedUrl.searchParams.get('v');
//       return videoId && videoId.length === 11 ? videoId : null;
//     } catch {
//       return null;
//     }
//   };

//   // 페이지 접근 제어: 토큰 확인
//   useEffect(() => {
//     const token = sessionStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       router.push('/login'); // 로그인 페이지로 리다이렉트
//     }
//   }, [router]);

//   // 메모 저장 핸들러
//   const handleSave = async () => {
//     setError(null);

//     if (!title.trim()) {
//       alert('제목을 입력해주세요.');
//       return;
//     }

//     if (links.some((link) => link.trim() === '')) {
//       alert('모든 링크를 입력해주세요.');
//       return;
//     }

//     // 유효한 YouTube Video ID만 추출
//     const parsedLinks = links.map((link) => extractVideoId(link)).filter((id) => id !== null);

//     if (parsedLinks.length !== links.length) {
//       alert('유효한 YouTube Video ID를 입력해주세요.');
//       return;
//     }

//     const token = sessionStorage.getItem('token'); // 'token'에 JWT 저장했다고 가정
//     let userId = null;
//     if (token) {
//         const payload = JSON.parse(atob(token.split('.')[1])); // Base64 디코딩
//         userId = payload.userId; // payload 내부의 userId
//         console.log(userId);
//     } else {
//         console.log('Token not found in session storage');
//     }
//     const data = { title, links: parsedLinks, userId};

//     try {
//       setIsLoading(true);

//       const response = await fetch('http://localhost:5050/home/video/:videoId/memos', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
//         },
//         body: JSON.stringify(data),
//       });
//       console.log(response);
//       if (response.ok) {
//         alert('저장 성공!');
//         setTitle('');
//         setLinks(['']);
//       } else {
//         const errorData = await response.json();

//         // 인증 실패 처리
//         if (response.status === 401) {
//           alert('로그인이 만료되었습니다. 다시 로그인하세요.');
//           sessionStorage.removeItem('token');
//           router.push('/login');
//         } else {
//           alert(`저장 실패: ${errorData.message}`);
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setError('서버와 통신 중 오류가 발생했습니다.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 링크 추가 및 변경 핸들러
//   const handleLinkChange = (index: number, value: string) => {
//     const updatedLinks = [...links];
//     updatedLinks[index] = value;
//     setLinks(updatedLinks);
//   };

//   return (
//     <>
//       <Header />
//       <div className={style.createPage}>
//         <h1>메모 작성하기</h1>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <InputTitle onChange={(e) => setTitle(e.target.value)} />
//         <InputLink
//           links={links}
//           onChange={handleLinkChange}
//           onAdd={() => setLinks([...links, ''])}
//         />
//         <CreateButton onSave={handleSave} isLoading={isLoading} />
//       </div>
//     </>
//   );
// }

'use client';
// components
import Header from '@/app/components/Layout/Header';
import InputLink from './components/inputLink/InputLink';
import InputTitle from './components/inputTitle/InputTitle';
import CreateButton from './components/createButton/CreateButton';
// style
import style from './Create.module.css';
// next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();

  // 상태 관리
  const [name, setName] = useState(''); // 제목을 name으로 변경
  const [links, setLinks] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 유효성 검사 함수
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // YouTube Video ID 추출 함수
  const extractVideoId = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const videoId = parsedUrl.searchParams.get('v');
      return videoId && videoId.length === 11 ? videoId : null;
    } catch {
      return null;
    }
  };

  // 페이지 접근 제어: 토큰 확인
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login'); // 로그인 페이지로 리다이렉트
    }
  }, [router]);

  // 저장 핸들러
  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (links.some((link) => link.trim() === '')) {
      alert('모든 링크를 입력해주세요.');
      return;
    }

    // 유효한 YouTube Video ID만 추출
    const videoIds = links.map((link) => extractVideoId(link)).filter((id) => id !== null);

    if (videoIds.length !== links.length) {
      alert('유효한 YouTube Video ID를 입력해주세요.');
      return;
    }

    // 백엔드에서 'name'과 'videoIds'로 받으므로 데이터 형식 변경
    const data = { name, videoIds };

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:5050/home/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      console.log('여기를봐',name);
      console.log('여기를봐',videoIds);
      console.log(response);
      if (response.ok) {
        alert('저장 성공!');
        setName('');
        setLinks(['']);
      } else {
        const errorData = await response.json();

        // 인증 실패 처리
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인하세요.');
          sessionStorage.removeItem('token');
          router.push('/login');
        } else {
          alert(`저장 실패: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 링크 추가 및 변경 핸들러
  const handleLinkChange = (index: number, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  return (
    <>
      <Header />
      <div className={style.createPage}>
        <h1>메모 작성하기</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <InputTitle onChange={(e) => setName(e.target.value)} />
        <InputLink
          links={links}
          onChange={handleLinkChange}
          onAdd={() => setLinks([...links, ''])}
        />
        <CreateButton onSave={handleSave} isLoading={isLoading} />
      </div>
    </>
  );
}