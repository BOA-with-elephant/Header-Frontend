
// 전화번호에 자동으로 하이픈 추가하는 함수
export const autoHyphen = (phone) => {
    // 숫자만 남기기 (정규표현식 사용)
    const onlyNums = phone.replace(/[^0-9]/g, '');

    if (onlyNums.startsWith('02')) {
        // 서울 번호: 02-XXXX-XXXX
        return onlyNums.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    } else if (onlyNums.startsWith('050') || onlyNums.startsWith('070')) {
        // 인터넷 전화
        return onlyNums.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    } else {
        // 휴대폰이나 다른 지역번호
        return onlyNums.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    }
};