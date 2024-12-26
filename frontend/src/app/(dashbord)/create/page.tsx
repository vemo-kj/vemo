'use client'
import InputLink from './components/inputLink/InputLink';
import InputTitle from './components/inputTitle/InputTitle';
import CreateButton from './components/createButton/CreateButton';
import style from './Create.module.css';
import { useState } from 'react';

export default function CreatePage() {

  const [title, setTitle] = useState('');
  const [links, setLinks] = useState<string[]>(['']);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (links.some((link) => link.trim() === '')) {
      alert('모든 링크를 입력해주세요.');
      return;
    }
    // 어떤 user인지 확인해야 할듯
    const data = {
      title,
      links,
    };

    try {
      const response = await fetch('/api/memo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('저장 성공!');
        setTitle('');
        setLinks(['']);
      } else {
        alert('저장 실패!');
        console.log('데이터:  ', data);     
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
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
      <CreateButton onSave={handleSave} />
    </div>
  );
}