import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // [수정됨] 받은 timestamp는 문자열이므로 new Date()로 변환 가능
    // 실제 백엔드 스펙에 맞춰서 description = htmlContent, memosId = 1 등 임의 설정
    const memoData = {
      timestamp: body.timestamp,    // 문자열
      description: body.htmlContent,
      memosId: 1
    };
    
    console.log('Sending memo data to backend:', memoData);

    // 로컬 백엔드(예: NestJS, Node, Spring 등)로 재요청
    const response = await fetch('http://localhost:3001/memo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memoData),
    });

    // [수정됨] 응답을 JSON으로 파싱
    const responseData = await response.json();
    console.log('Backend response:', response.status, responseData);

    if (!response.ok) {
      throw new Error(JSON.stringify(responseData));
    }

    // 정상 응답
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error in POST /api/memos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create memo' }, 
      { status: 500 }
    );
  }
}