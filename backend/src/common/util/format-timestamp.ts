export function formatTimestamp(timestamp: string): string {
    // 초 값이 없으면 0을 기본값으로 설정
    const [hours, minutes, seconds = 0] = timestamp.split(':').map(Number);

    // 전체 시간을 계산 (분 단위)
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes < 120) {
        // 120분 이하: MM:SS 형식
        const formattedMinutes = totalMinutes.toString();
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    // 120분 초과: HH:MM:SS 형식
    const formattedHours = hours.toString();
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
