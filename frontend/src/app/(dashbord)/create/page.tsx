'use client'
import InputLink from './components/inputLink/InputLink';
import InputTitle from './components/inputTitle/InputTitle';
import CreateButton from './components/createButton/CreateButton';
import style from './Create.module.css';
import { useState } from 'react';

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (links.some((link) => link.trim() === '')) {
      alert('모든 링크를 입력해주세요.');
      return;
    }

    if (links.some((link) => !isValidUrl(link))) {
      alert('유효한 URL을 입력해주세요.');
      return;
    }

    const data = {
      title,
      links,
    };

    try {
      setIsLoading(true);
      const response = await fetch('/api/memo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 인증 토큰 추가
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('저장 성공!');
        setTitle('');
        setLinks(['']);
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.createPage}>
      <h1>메모 작성하기</h1>
      <InputTitle onChange={(e) => setTitle(e.target.value)} />
      <InputLink
        links={links}
        onChange={(index, value) => {
          const updatedLinks = [...links];
          updatedLinks[index] = value;
          setLinks(updatedLinks);
        }}
        onAdd={() => setLinks([...links, ''])}
      />
      <CreateButton onSave={handleSave} isLoading={isLoading} />
    </div>
  );
}