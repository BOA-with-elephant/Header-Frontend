// YYYY-MM-DD 형식으로 변환
export const formatDate = (date) => {
    if (!date) return null;
    // getTimezoneOffset을 사용하여 한국 시간에 맞춰 날짜 보정
    date = new Date(date);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().split('T')[0];
};

// YYYY.MM.DD (요일) 형식으로 변환
export const displayDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateStr);
    const dayName = days[date.getUTCDay()]; // UTC 날짜 기준으로 요일 계산
    return `${dateStr.replace(/-/g, '.')} (${dayName})`;
};