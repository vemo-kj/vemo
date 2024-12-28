export default function ExportButton() {
  const handleDownloadPDF = async () => {
    const response = await fetch("/api/download", {
      method: "GET",
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample.pdf"; // 다운로드할 파일이름이 들어갈수 있도록 설정
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return <button onClick={handleDownloadPDF}>내보내기</button>;
}