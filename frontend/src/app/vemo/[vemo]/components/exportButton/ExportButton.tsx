'use client';

export default function ExportButton() {
  const memosId = 46;  // 다른 ID로 테스트

  const handleDownloadPDF = async () => {
    try {
      console.log('PDF 다운로드 요청 시작:', memosId);

      const response = await fetch(`http://localhost:5050/pdf/download/${memosId}`, {
        method: "GET",
        headers: {
          'Accept': 'application/pdf',
        },
      });

      // 서버 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 에러:', {
          status: response.status,
          text: errorText
        });
        throw new Error(`서버 에러: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vemo_${memosId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      console.log('PDF 다운로드 완료');
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드에 실패했습니다.');
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      style={{
        padding: '8px 16px',
        backgroundColor: '#007AFF',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
    >
      내보내기
    </button>
  );
}

