// 날짜 1.1 형태로 포맷
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}. ${date.getDate()}`;
}

// 시간 오후 2:30 형태로 포맷
export const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const period = parseInt(hours) >= 12? '오후':'오전';
    const formattedHours = parseInt(hours) % 12 || 12;
    // 주어진 시간 (hours)을 12시간 형식으로 변환하고, 12시간을 넘는 경우 다시 12시간으로 나눈 나머지를 구한 후, 0인 경우 12로 대체하는 코드
    return `${period} ${formattedHours}:${minutes}`;
}