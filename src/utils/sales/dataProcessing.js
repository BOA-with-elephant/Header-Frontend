/**
 * 매출 데이터 처리 유틸리티 모듈
 * 
 * 이 모듈은 매출 통계 시스템에서 데이터 필터링, 변환, 집계를 담당합니다.
 * 
 * 주요 기능:
 * - 다양한 날짜 형식 파싱 및 표준화
 * - 기간별 데이터 필터링 (오늘, 이번 달, 최근 3개월 등)
 * - 시간 단위별 데이터 집계 (일별, 주별, 월별)
 * - 월별 통계 데이터 필터링
 * - 안전한 날짜 처리 및 예외 상황 관리
 * 
 * 설계 원칙:
 * - 방어적 프로그래밍: null/undefined 체크 및 예외 처리
 * - 유연성: 다양한 백엔드 DTO 필드명 지원
 * - 성능: 효율적인 필터링 및 집계 알고리즘
 * - 디버깅: 상세한 로그로 데이터 흐름 추적 가능
 */

// src/utils/sales/dataProcessing.js

/**
 * 날짜 필드 우선순위 배열
 * 백엔드 DTO에서 날짜 정보를 찾을 때 사용할 필드명들을 우선순위 순으로 정의
 * 
 * 우선순위 기준:
 * 1. createdDate: 가장 일반적인 생성일시 필드
 * 2. payDatetime: 결제일시 (결제 관련 분석에 중요)
 * 3. orderDate: 주문일자
 * 4. saleDate: 매출일자
 * 5. 기타: 범용적으로 사용되는 날짜 필드들
 * 
 * 사용 방법: 배열 순서대로 필드를 확인하여 첫 번째로 유효한 값을 사용
 */
const DATE_FIELDS = [
  'createdDate',      // 생성일시 (최우선)
  'payDatetime',      // 결제일시
  'orderDate',        // 주문일자
  'saleDate',         // 매출일자
  'date',             // 범용 날짜 필드
  'regDate',          // 등록일자
  'paymentDate',      // 결제 날짜
  'transactionDate'   // 거래일자
];

// ============================
// 날짜 파싱 유틸리티
// ============================

/**
 * 다양한 날짜 형식을 표준 Date 객체로 변환하는 함수
 * 
 * 지원하는 날짜 형식:
 * 1. ISO 8601: "2024-07-21T10:30:00.000Z", "2024-07-21T10:30:00"
 * 2. 슬래시 구분: "2024/07/21", "07/21/2024"
 * 3. 타임스탬프: 1234567890 (초), 1234567890000 (밀리초)
 * 4. 문자열 타임스탬프: "1234567890000"
 * 
 * 에러 처리:
 * - null/undefined 입력: Invalid Date 반환
 * - 파싱 실패: Invalid Date 반환 및 경고 로그
 * - 유효성 검사: isNaN()으로 최종 검증
 * 
 * @param {string|number|null|undefined} dateValue - 파싱할 날짜 값
 * @returns {Date} 파싱된 Date 객체 (실패 시 Invalid Date)
 * 
 * @example
 * parseDate("2024-07-21T10:30:00Z") // → Date 객체
 * parseDate("2024/07/21") // → Date 객체
 * parseDate(1234567890000) // → Date 객체
 * parseDate(null) // → Invalid Date
 */
export const parseDate = (dateValue) => {
  // null/undefined 입력 검증
  if (dateValue === null || dateValue === undefined) {
    return new Date(NaN); // Invalid Date 반환
  }

  // 문자열 타입 처리
  if (typeof dateValue === 'string') {
    // ISO 8601 형식 또는 하이픈 구분 형식 (YYYY-MM-DD...)
    if (dateValue.includes('T') || (dateValue.includes('-') && dateValue.length >= 10)) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) return date;
    }
    // 슬래시 구분 형식 (YYYY/MM/DD 또는 MM/DD/YYYY)
    else if (dateValue.includes('/')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        // YYYY/MM/DD 형식 (첫 번째 부분이 4자리 연도)
        if (parts[0].length === 4) {
          const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!isNaN(date.getTime())) return date;
        }
        // MM/DD/YYYY 형식 (세 번째 부분이 4자리 연도)
        else if (parts[2].length === 4) {
          const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          if (!isNaN(date.getTime())) return date;
        }
      }
    }
    // 문자열로 된 타임스탬프
    else {
      const numValue = parseInt(dateValue);
      if (!isNaN(numValue)) {
        // 13자리면 밀리초, 10자리면 초 단위로 판단
        const date = new Date(numValue > 1000000000000 ? numValue : numValue * 1000);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  // 숫자 타입 처리 (타임스탬프)
  else if (typeof dateValue === 'number') {
    // 13자리 이상이면 밀리초, 그 이하면 초 단위로 판단
    const date = new Date(dateValue > 1000000000000 ? dateValue : dateValue * 1000);
    if (!isNaN(date.getTime())) return date;
  }

  // 모든 파싱 시도 실패 시 경고 로그 출력 및 Invalid Date 반환
  console.warn(`parseDate: 유효하지 않은 날짜 형식 감지: "${dateValue}"`);
  return new Date(NaN);
};

// ============================
// 기본 필터링 함수들
// ============================

/**
 * 시작일과 종료일로 매출 데이터를 필터링하는 함수
 * PeriodFilter 컴포넌트의 사용자 정의 기간 설정에서 주로 사용
 * 
 * 처리 과정:
 * 1. 입력 데이터 유효성 검증
 * 2. 날짜 범위 계산 (시작일 00:00:00 ~ 종료일 23:59:59)
 * 3. 각 항목에서 유효한 날짜 필드 탐색
 * 4. 날짜 파싱 및 범위 내 여부 확인
 * 5. 필터링 결과 반환 및 로그 출력
 * 
 * @param {Array} salesData - 필터링할 매출 데이터 배열
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD 형식)
 * @returns {Array} 필터링된 매출 데이터 배열
 * 
 * @example
 * filterSalesByDateRange(salesData, "2024-07-01", "2024-07-31")
 * // → 2024년 7월 전체 데이터 반환
 */
export function filterSalesByDateRange(salesData, startDate, endDate) {
  // 입력 데이터 유효성 검증
  if (!Array.isArray(salesData) || salesData.length === 0) {
    console.warn('[dataProcessing] filterSalesByDateRange: 필터링할 데이터가 없음.');
    return [];
  }

  // 날짜 범위 설정 (시작일 00:00:00, 종료일 23:59:59)
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 날짜 유효성 검증
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('[dataProcessing] filterSalesByDateRange: 유효하지 않은 시작/종료 날짜:', { startDate, endDate });
    return [];
  }

  console.log(`[dataProcessing] filterSalesByDateRange: 필터 범위: ${start.toISOString()} ~ ${end.toISOString()}`);

  // 데이터 필터링 수행
  const filtered = salesData.filter(item => {
    let dateValue = null;

    // DATE_FIELDS 우선순위에 따라 날짜 찾기
    for (const field of DATE_FIELDS) {
      if (item[field] !== undefined && item[field] !== null) {
        dateValue = item[field];
        break;
      }
    }

    if (dateValue === null) return false;

    const itemDate = parseDate(dateValue);
    if (isNaN(itemDate.getTime())) return false;

    return itemDate >= start && itemDate <= end;
  });

  console.log(`[dataProcessing] filterSalesByDateRange 결과: ${filtered.length}/${salesData.length} 항목`);
  return filtered;
}


/**
 * 프리셋 기간으로 매출 데이터를 필터링하는 함수
 * PERIOD_BUTTONS의 각 기간 옵션에 대응하는 실제 필터링 로직
 * 
 * 지원하는 기간 타입:
 * - 단일 날짜: today, yesterday
 * - 상대적 기간: week (7일), month (현재 월), last3months
 * - 절대적 기간: thisYear, lastYear, year2024
 * - 전체 데이터: all
 * 
 * 날짜 계산 방식:
 * - 모든 계산은 현재 날짜 기준으로 수행
 * - 시간 정보를 초기화하여 '일' 단위로 정확한 비교
 * - 종료일은 23:59:59.999로 설정하여 하루 전체 포함
 * 
 * @param {Array} salesData - 필터링할 매출 데이터 배열
 * @param {string} period - 기간 타입 ('today', 'month', 'thisYear' 등)
 * @returns {Array} 필터링된 매출 데이터 배열
 * 
 * @example
 * filterSalesByPeriod(salesData, "month") // → 이번 달 데이터
 * filterSalesByPeriod(salesData, "year2024") // → 2024년 데이터
 */
export const filterSalesByPeriod = (salesData, period) => {
  console.log(`[dataProcessing] filterSalesByPeriod 호출: period='${period}', initialDataCount: ${salesData?.length}`);

  // 입력 데이터 유효성 검증
  if (!Array.isArray(salesData) || salesData.length === 0) {
    console.warn('[dataProcessing] filterSalesByPeriod: 필터링할 데이터가 없음.');
    return [];
  }

  // 'all' 기간은 모든 데이터를 반환 (필터링 없음)
  if (period === 'all') {
    return salesData;
  }

  const now = new Date();
  let startDate, endDate;

  // 시간 정보를 초기화하여 날짜 비교의 정확성 확보
  now.setHours(0, 0, 0, 0); // 현재 날짜의 00:00:00

  // 기간별 날짜 범위 계산
  switch (period) {
    case 'yesterday':
      // 어제 하루 (어제 00:00:00 ~ 어제 23:59:59)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      endDate = new Date(startDate);
      break;

    case 'today':
      // 오늘 하루 (오늘 00:00:00 ~ 오늘 23:59:59)
      startDate = new Date(now);
      endDate = new Date(now);
      break;

    case '3days':
      // 최근 3일 (오늘 포함, 예: 월요일이면 토/일/월)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 2);
      endDate = new Date(now);
      break;

    case 'week':
      // 최근 7일 (오늘 포함)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      endDate = new Date(now);
      break;

    case 'month':
      // 현재 월 전체 (이번 달 1일 ~ 이번 달 마지막 날)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 다음 달 0일 = 이번 달 마지막 날
      break;

    case 'last3months':
      // 최근 3개월 (3개월 전 1일 ~ 이번 달 마지막 날)
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 현재 월 포함 3개월
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case 'last12months':
      // 최근 12개월 (주로 월별 집계에서 사용, 원본 데이터 필터링에도 적용)
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 현재 월 포함 12개월
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case 'thisYear':
      // 올해 전체 (1월 1일 ~ 12월 31일)
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;

    case 'lastYear':
      // 작년 전체 (작년 1월 1일 ~ 작년 12월 31일)
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;

    default:
      // 특정 연도 필터링 (예: 'year2024')
      if (period.startsWith('year')) {
        const targetYear = parseInt(period.replace('year', ''));
        if (!isNaN(targetYear)) {
          startDate = new Date(targetYear, 0, 1);
          endDate = new Date(targetYear, 11, 31);
        } else {
          console.warn(`[dataProcessing] filterSalesByPeriod: 알 수 없는 period 값 "${period}". 모든 데이터 반환.`);
          return salesData;
        }
      } else {
        console.warn(`[dataProcessing] filterSalesByPeriod: 알 수 없는 period 값 "${period}". 모든 데이터 반환.`);
        return salesData; // 정의되지 않은 period가 들어오면 모든 데이터 반환
      }
      break;
  }

  // 종료 날짜는 해당 날의 마지막 시점으로 설정 (23:59:59.999)
  endDate.setHours(23, 59, 59, 999);

  // 계산된 날짜 유효성 검증
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('[dataProcessing] filterSalesByPeriod: 유효하지 않은 계산된 시작/종료 날짜:',
      { startDate, endDate, period });
    return [];
  }

  console.log(`[dataProcessing] filterSalesByPeriod: 필터 범위 (${period}): ${startDate.toISOString()} ~ ${endDate.toISOString()}`);

  // 데이터 필터링 수행
  const filtered = salesData.filter(item => {
    let dateValue = null;

    // 우선순위에 따라 유효한 날짜 필드 탐색
    for (const field of DATE_FIELDS) {
      if (item[field] !== undefined && item[field] !== null) {
        dateValue = item[field];
        break;
      }
    }

    // 날짜 필드가 없는 항목 제외
    if (dateValue === null) {
      return false;
    }

    // 날짜 파싱 및 유효성 검사
    const itemDate = parseDate(dateValue);
    if (isNaN(itemDate.getTime())) {
      return false;
    }

    // 날짜 범위 내 포함 여부 확인
    return itemDate >= startDate && itemDate <= endDate;
  });

  console.log(`[dataProcessing] filterSalesByPeriod 결과: ${filtered.length}/${salesData.length} 항목`);
  return filtered;
};

// ============================
// 데이터 집계 및 변환 함수들
// ============================

/**
 * 거래 데이터를 시간 단위별로 집계하는 함수
 * TransactionTrendChart에서 일별/주별/월별 거래 건수 추이 표시용
 * 
 * 처리 과정:
 * 1. 지정된 기간으로 원본 데이터 필터링
 * 2. 집계 단위에 따라 데이터 그룹핑 (일별/주별/월별)
 * 3. 각 그룹별 거래 건수 계산
 * 4. 차트 표시용 라벨 생성 및 정렬
 * 
 * 집계 단위별 키 생성:
 * - daily: "2024-07-21" (YYYY-MM-DD)
 * - weekly: "2024-07-21" (해당 주의 일요일 날짜)
 * - monthly: "2024-07" (YYYY-MM)
 * 
 * @param {Array} salesData - 집계할 매출 데이터 배열
 * @param {string} unit - 집계 단위 ('daily', 'weekly', 'monthly')
 * @param {string} period - 조회 기간 ('month', 'last3months' 등)
 * @returns {Array} 집계된 거래 데이터 배열 [{ period, count, displayLabel }]
 * 
 * @example
 * processTransactionData(salesData, 'daily', 'month')
 * // → [{ period: '2024-07-01', count: 15, displayLabel: '7/1' }, ...]
 */
export const processTransactionData = (salesData, unit, period) => {
  console.log(`[dataProcessing] processTransactionData 호출: unit='${unit}', period='${period}'`);

  // 1. 먼저 선택된 기간으로 원본 데이터 필터링
  const filteredData = filterSalesByPeriod(salesData, period);
  console.log(`[dataProcessing] processTransactionData - filterSalesByPeriod 후 데이터 개수: ${filteredData.length}`);

  // 2. 집계용 Map 초기화 (키: 시간 단위별 구분자, 값: 집계 정보)
  const groupMap = new Map();

  // 3. 필터링된 데이터를 집계 단위별로 그룹핑
  filteredData.forEach(item => {
    let dateValue = null;

    // 유효한 날짜 필드 탐색
    for (const field of DATE_FIELDS) {
      if (item[field] !== undefined && item[field] !== null) {
        dateValue = item[field];
        break;
      }
    }

    // 날짜 필드가 없는 항목 건너뛰기
    if (dateValue === null) return;

    // 날짜 파싱
    const itemDate = parseDate(dateValue);
    if (isNaN(itemDate.getTime())) return;

    // 집계 단위에 따른 그룹핑 키 생성
    let key;
    switch (unit) {
      case 'daily':
        // 일별: YYYY-MM-DD 형식
        key = itemDate.toISOString().split('T')[0]; // "2024-07-21"
        break;

      case 'weekly':
        // 주별: 해당 주의 일요일 날짜 사용
        const weekStart = new Date(itemDate);
        const dayOfWeek = itemDate.getDay(); // 0(일요일) ~ 6(토요일)
        weekStart.setDate(itemDate.getDate() - dayOfWeek); // 일요일로 설정
        key = weekStart.toISOString().split('T')[0];
        break;

      case 'monthly':
        // 월별: YYYY-MM 형식
        key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        break;

      default:
        // 기본값: 일별로 처리
        key = itemDate.toISOString().split('T')[0];
    }

    // 해당 키의 집계 정보가 없으면 초기화
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        period: key,                              // 그룹핑 키
        count: 0,                                // 거래 건수
        displayLabel: formatPeriodLabel(key, unit) // 차트 표시용 라벨
      });
    }

    // 거래 건수 증가
    groupMap.get(key).count += 1;
  });

  // 4. Map을 배열로 변환하고 시간순으로 정렬
  const result = Array.from(groupMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  console.log(`[dataProcessing] processTransactionData 결과: ${result.length} 항목`);
  return result;
};

/**
 * 월별 집계 데이터를 특정 기간으로 필터링하는 함수
 * MonthlyTrendChart에서 API로 받은 월별 통계를 원하는 기간만 표시할 때 사용
 * 
 * 주요 사용 사례:
 * - API에서 전체 월별 데이터를 받은 후 '최근 12개월'만 표시
 * - '올해', '작년' 등 특정 연도 데이터만 필터링
 * - '특정 연도' (year2024) 데이터 추출
 * 
 * 입력 데이터 구조: [{ year: 2024, month: 7, amount: 1000000, ... }]
 * 
 * @param {Array} data - 월별 집계된 데이터 배열 (year, month 필드 포함)
 * @param {string} period - 필터링할 기간 ('last12months', 'thisYear', 'lastYear', 'yearXXXX')
 * @returns {Array} 필터링된 월별 데이터 배열
 * 
 * @example
 * filterMonthlyData(monthlyData, 'last12months')
 * // → 현재 월부터 과거 12개월간의 데이터만 반환
 */
export const filterMonthlyData = (data, period) => {
  console.log(`[dataProcessing] filterMonthlyData 호출: period='${period}', initialDataCount: ${data?.length}`);

  // 입력 데이터 유효성 검증
  if (!data || data.length === 0) {
    console.warn('[dataProcessing] filterMonthlyData: 필터링할 데이터가 없음.');
    return [];
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  switch (period) {
    case 'last12months':
      // 현재 월을 포함하여 지난 12개월의 데이터 필터링
      const targetMonths = new Set();

      // 현재 월부터 과거로 11개월 더해서 총 12개월 범위 생성
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        targetMonths.add(yearMonthKey);
      }

      console.log('[dataProcessing] filterMonthlyData - last12months: 목표 월:',
        Array.from(targetMonths).sort());

      // 데이터 필터링: item의 year, month를 YYYY-MM 형식으로 변환하여 비교
      const filtered12Months = data.filter(item => {
        const itemYearMonth = `${item.year}-${String(item.month).padStart(2, '0')}`;
        const isIncluded = targetMonths.has(itemYearMonth);
        return isIncluded;
      });

      // 연도-월 순으로 정렬 (오래된 것부터)
      filtered12Months.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      });

      console.log(`[dataProcessing] filterMonthlyData - last12months 결과: ${filtered12Months.length} 항목`);
      return filtered12Months;

    case 'thisYear':
      // 올해 데이터만 필터링 (1월~12월)
      const thisYearFiltered = data.filter(item => item.year === currentYear);
      console.log(`[dataProcessing] filterMonthlyData - thisYear 결과: ${thisYearFiltered.length} 항목`);
      return thisYearFiltered;

    case 'lastYear':
      // 작년 데이터만 필터링
      const lastYearFiltered = data.filter(item => item.year === currentYear - 1);
      console.log(`[dataProcessing] filterMonthlyData - lastYear 결과: ${lastYearFiltered.length} 항목`);
      return lastYearFiltered;

    case 'all':
      // 모든 데이터 반환 (필터링 없음)
      console.log(`[dataProcessing] filterMonthlyData - all 결과: ${data.length} 항목`);
      return data;

    default:
      // 특정 연도 필터링 (예: 'year2024', 'year2023')
      if (period.startsWith('year')) {
        const targetYear = parseInt(period.replace('year', ''));
        if (!isNaN(targetYear)) {
          const yearFiltered = data.filter(item => item.year === targetYear);
          console.log(`[dataProcessing] filterMonthlyData - year${targetYear} 결과: ${yearFiltered.length} 항목`);
          return yearFiltered;
        }
      }

      // 알 수 없는 period 값인 경우 경고 후 전체 데이터 반환
      console.warn(`[dataProcessing] filterMonthlyData: 알 수 없는 period 값 "${period}". 모든 데이터 반환.`);
      return data;
  }
};

// ============================
// 유틸리티 및 포맷팅 함수들
// ============================

/**
 * 시간 단위별 기간 라벨을 사용자 친화적 형태로 포맷팅하는 함수
 * 차트의 X축 라벨이나 툴팁에서 표시될 텍스트를 생성
 * 
 * 포맷팅 규칙:
 * - daily: "7/21" (월/일)
 * - weekly: "7/21 주" (해당 주 시작일 + "주")
 * - monthly: "2024년 7월" (YYYY년 M월)
 * 
 * 에러 처리:
 * - 날짜 파싱 실패 시 원본 키 반환
 * - 예외 발생 시 오류 로그 후 원본 키 반환
 * 
 * @param {string} key - 집계 시 생성된 시간 키 ("2024-07-21", "2024-07" 등)
 * @param {string} unit - 집계 단위 ('daily', 'weekly', 'monthly')
 * @returns {string} 사용자 친화적 라벨 텍스트
 * 
 * @example
 * formatPeriodLabel("2024-07-21", "daily") // → "7/21"
 * formatPeriodLabel("2024-07-21", "weekly") // → "7/21 주"
 * formatPeriodLabel("2024-07", "monthly") // → "2024년 7월"
 * 
 * @private 이 함수는 모듈 내부에서만 사용됩니다.
 */
const formatPeriodLabel = (key, unit) => {
  try {
    switch (unit) {
      case 'daily':
        // 일별: YYYY-MM-DD → M/D
        const date = new Date(key);
        if (isNaN(date.getTime())) return key;
        return `${date.getMonth() + 1}/${date.getDate()}`; // 예: "7/21"

      case 'weekly':
        // 주별: YYYY-MM-DD → M/D 주
        const weekDate = new Date(key);
        if (isNaN(weekDate.getTime())) return key;
        return `${weekDate.getMonth() + 1}/${weekDate.getDate()} 주`; // 예: "7/21 주"

      case 'monthly':
        // 월별: YYYY-MM → YYYY년 M월
        const [year, month] = key.split('-');
        return `${parseInt(year)}년 ${parseInt(month)}월`; // 예: "2024년 7월"

      default:
        // 알 수 없는 단위인 경우 원본 키 반환
        return key;
    }
  } catch (error) {
    // 포맷팅 중 오류 발생 시 로그 출력 후 원본 키 반환
    console.error('[dataProcessing] 라벨 포맷팅 오류:', error, key, unit);
    return key;
  }
};