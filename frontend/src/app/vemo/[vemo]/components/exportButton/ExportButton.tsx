import Image from 'next/image';
import styles from './ExportButton.module.css';

export default function ExportButton() {
  const handleDownloadPDF = async () => {
    const response = await fetch("/api/download", {
      method: "GET",
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownloadPDF} className={styles.iconButton}>
      <div className={styles.iconContainer}>
        <Image
          className={styles.defaultIcon}
          src="/icons/bt_edit_nav_export.svg"
          alt="내보내기"
          width={20}
          height={20}
        />
      </div>
      <span className={styles.iconButtonText}>내보내기</span>
    </button>
  );
}

