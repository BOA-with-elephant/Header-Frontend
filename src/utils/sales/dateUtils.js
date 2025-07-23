/**
 * 날짜 처리 유틸리티 모듈
 * 
 * 이 모듈은 매출 통계 시스템에서 날짜 관련 계산과 포맷팅을 담당합니다.
 * 
 * 주요 기능:
 * - 시간대 문제 해결을 위한 안전한 날짜 포맷팅
 * - 프리셋 기간별 날짜 범위 자동 계산 (PERIOD_BUTTONS 연동)
 * - 현재 월 범위 계산 (초기값 설정용)
 * - 차트 표시용 기간 라벨 포맷팅
 * 
 * 설계 원칙:
 * - 시간대 독립: UTC/로컬 타임존 차이로 인한 날짜 오차 방지
 * - 일관성: 모든 날짜 계산이 동일한 로직 사용
 * - 정확성: 월말일, 윤년 등 특수 상황 고려
 * - 재사용성: PeriodFilter, useDateFilter에서 공통 사용
 */

// ============================
// 핵심 포맷팅 함수
// ============================

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환하는 함수
 * 
 * 시간대 문제 해결:
 * - toISOString() 사용 시 UTC 변환으로 인한 날짜 변경 방지
 * - getFullYear(), getMonth(), getDate()를 직접 사용하여 로컬 날짜 보장
 * - 시간 정보를 완전히 제거하여 '날짜'만 처리
 * 
 * 사용 사례:
 * - HTML date input의 value 속성 설정
 * - 백엔드 API 날짜 파라미터 전송
 * - 날짜 범위 비교를 위한 표준화
 * 
 * @param {Date} date - 포맷팅할 Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 * 
 * @example
 * formatDate(new Date(2024, 6, 21)) // → "2024-07-21"
 * formatDate(new Date()) // → "2024-07-21" (오늘 날짜)
 */
export const formatDate = (date) => {
  const year = date.getFullYear();                              // 4자리 연도
  const month = String(date.getMonth() + 1).padStart(2, '0');   // 월 (0-based → 1-based, 2자리)
  const day = String(date.getDate()).padStart(2, '0');          // 일 (2자리)
  return `${year}-${month}-${day}`;
};

// ============================
// 초기값 계산 함수
// ============================

/**
 * 현재 월의 시작일과 마지막일을 계산하는 함수
 * useDateFilter 훅의 초기 dateRange 설정에 사용
 * 
 * 계산 방식:
 * - 시작일: 현재 월의 1일 (1일로 고정)
 * - 마지막일: 다음 달 0일 = 현재 월의 마지막 날 (28~31일 자동 계산)
 * 
 * 특수 상황 처리:
 * - 2월: 28일 또는 29일 (윤년 자동 계산)
 * - 소월(4,6,9,11): 30일
 * - 대월(1,3,5,7,8,10,12): 31일
 * 
 * @returns {Object} 현재 월 날짜 범위 객체
 * @returns {string} returns.startDate - 현재 월 1일 (YYYY-MM-01)
 * @returns {string} returns.endDate - 현재 월 마지막일 (YYYY-MM-DD)
 * 
 * @example
 * // 2024년 7월에 호출한 경우
 * getThisMonthRange() // → { startDate: "2024-07-01", endDate: "2024-07-31" }
 * 
 * // 2024년 2월에 호출한 경우 (윤년)
 * getThisMonthRange() // → { startDate: "2024-02-01", endDate: "2024-02-29" }
 */
export const getThisMonthRange = () => {
  const now = new Date();
  
  // 현재 월의 1일
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 현재 월의 마지막 날 (다음 달의 0일 = 현재 월 마지막 날)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// ============================
// 기간별 날짜 범위 계산
// ============================

/**
 * 프리셋 기간 키를 받아서 실제 날짜 범위를 계산하는 함수
 * PERIOD_BUTTONS의 각 기간 옵션을 실제 시작일-종료일로 변환
 * 
 * 지원하는 기간 타입:
 * - 단일 날짜: yesterday, today (시작일 = 종료일)
 * - 상대 기간: 3days, week (현재 기준 과거 N일)
 * - 월 기간: month (현재 월 전체)
 * - 반기 기간: firstHalf (1~6월), secondHalf (7~12월)
 * - 연 기간: thisYear (올해), lastYear (작년)
 * 
 * 날짜 계산 정확성:
 * - 모든 계산은 현재 날짜 기준으로 수행
 * - 월말 처리: new Date(year, month + 1, 0) 활용
 * - 윤년 처리: JavaScript Date 객체의 자동 계산 활용
 * 
 * @param {string} period - 기간 키 ('today', 'month', 'thisYear' 등)
 * @returns {Object|null} 날짜 범위 객체 (유효하지 않은 기간이면 null)
 * @returns {string} returns.startDate - 시작일 (YYYY-MM-DD)
 * @returns {string} returns.endDate - 종료일 (YYYY-MM-DD)
 * 
 * @example
 * // 2024년 7월 21일에 호출한 경우들
 * calculateDateRange('today')     // → { startDate: "2024-07-21", endDate: "2024-07-21" }
 * calculateDateRange('week')      // → { startDate: "2024-07-15", endDate: "2024-07-21" }
 * calculateDateRange('month')     // → { startDate: "2024-07-01", endDate: "2024-07-31" }
 * calculateDateRange('thisYear')  // → { startDate: "2024-01-01", endDate: "2024-12-31" }
 * calculateDateRange('unknown')   // → null
 */
export const calculateDateRange = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case 'yesterday':
      // 어제: 하루 전 날짜 (시작일 = 종료일)
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      break;
      
    case 'today':
      // 오늘: 현재 날짜 (시작일 = 종료일)
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
      
    case '3days':
      // 최근 3일: 오늘 포함 3일간 (2일 전부터 오늘까지)
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
      
    case 'week':
      // 최근 일주일: 오늘 포함 7일간 (6일 전부터 오늘까지)
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
      
    case 'month':
      // 현재 월: 이번 달 1일부터 마지막 날까지
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // 다음 달 0일 = 이번 달 마지막 날
      break;
      
    case 'firstHalf':
      // 상반기: 1월 1일부터 6월 30일까지
      startDate = new Date(today.getFullYear(), 0, 1);   // 1월 1일
      endDate = new Date(today.getFullYear(), 5, 30);    // 6월 30일 (5는 6월을 의미)
      break;
      
    case 'secondHalf':
      // 하반기: 7월 1일부터 12월 31일까지
      startDate = new Date(today.getFullYear(), 6, 1);   // 7월 1일 (6은 7월을 의미)
      endDate = new Date(today.getFullYear(), 11, 31);   // 12월 31일 (11은 12월을 의미)
      break;
      
    case 'thisYear':
      // 올해: 1월 1일부터 12월 31일까지
      startDate = new Date(today.getFullYear(), 0, 1);   // 1월 1일
      endDate = new Date(today.getFullYear(), 11, 31);   // 12월 31일
      break;
      
    case 'lastYear':
      // 작년: 작년 1월 1일부터 12월 31일까지
      startDate = new Date(today.getFullYear() - 1, 0, 1);   // 작년 1월 1일
      endDate = new Date(today.getFullYear() - 1, 11, 31);   // 작년 12월 31일
      break;
      
    default:
      // 정의되지 않은 기간 키인 경우 null 반환
      // calculateDateRange를 호출한 쪽에서 null 체크 후 적절히 처리
      return null;
  }

  // 계산된 시작일과 종료일을 문자열로 변환하여 반환
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// ============================
// 차트 표시용 포맷팅
// ============================

/**
 * 차트 X축 라벨용 기간 표시명을 생성하는 함수
 * TransactionTrendChart 등에서 사용자 친화적인 라벨 표시용
 * 
 * 포맷팅 규칙:
 * - daily: 간결한 월/일 형식 (공간 절약)
 * - weekly: 해당 주 시작일 + "주" 표시 (주 단위 인식)
 * - monthly: 완전한 "년 월" 형식 (정확한 시기 표시)
 * 
 * 에러 처리:
 * - 날짜 파싱 실패 시 원본 키 반환
 * - try-catch로 예외 상황 안전 처리
 * - 콘솔 로그로 디버깅 정보 제공
 * 
 * @param {string} key - 집계 키 ("2024-07-21", "2024-07" 등)
 * @param {string} unit - 집계 단위 ('daily', 'weekly', 'monthly')
 * @returns {string} 사용자 친화적 라벨 텍스트
 * 
 * @example
 * formatPeriodLabel("2024-07-21", "daily")   // → "7/21"
 * formatPeriodLabel("2024-07-21", "weekly")  // → "7/21주"
 * formatPeriodLabel("2024-07", "monthly")    // → "2024년 7월"
 * formatPeriodLabel("invalid", "daily")      // → "invalid" (파싱 실패 시 원본)
 */
export const formatPeriodLabel = (key, unit) => {
  try {
    switch (unit) {
      case 'daily':
        // 일별: "2024-07-21" → "7/21"
        const date = new Date(key);
        return `${date.getMonth() + 1}/${date.getDate()}`;
        
      case 'weekly':
        // 주별: "2024-07-21" → "7/21주"
        const weekDate = new Date(key);
        return `${weekDate.getMonth() + 1}/${weekDate.getDate()}주`;
        
      case 'monthly':
        // 월별: "2024-07" → "2024년 7월"
        const [year, month] = key.split('-');
        return `${year}년 ${month}월`;
        
      default:
        // 알 수 없는 단위인 경우 원본 키 반환
        return key;
    }
  } catch (error) {
    // 포맷팅 중 오류 발생 시 로그 출력 후 원본 키 반환
    console.error('라벨 포맷팅 오류:', error, key, unit);
    return key;
  }
};