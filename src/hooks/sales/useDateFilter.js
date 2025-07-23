import { useState } from 'react';
import { getThisMonthRange, calculateDateRange } from '@/utils/sales/dateUtils';

/**
 * 날짜 필터링을 위한 커스텀 훅
 * - 기간 선택 (이번 달, 지난달, 최근 3개월 등)
 * - 사용자 정의 날짜 범위 설정
 * - 날짜 범위 계산 및 상태 관리
 */
export const useDateFilter = () => {
  // 선택된 기간 (month, lastMonth, last3months, custom 등)
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // 실제 사용될 날짜 범위 (startDate, endDate)
  const [dateRange, setDateRange] = useState(getThisMonthRange());

  /**
   * 기간 변경 핸들러
   * @param {string} period - 선택된 기간 ('month', 'lastMonth', 'last3months', 'custom' 등)
   */
  const handlePeriodChange = (period) => {
    console.log('기간 변경 요청:', period);
    
    // 사용자 정의 기간 선택 시 - 날짜 범위는 그대로 두고 period만 변경
    if (period === 'custom') {
      setSelectedPeriod('custom');
      return;
    }

    // 미리 정의된 기간 선택 시 - 해당 기간에 맞는 날짜 범위 자동 계산
    const calculatedRange = calculateDateRange(period);
    if (calculatedRange) {
      console.log('계산된 날짜 범위:', { period, ...calculatedRange });
      setSelectedPeriod(period);
      setDateRange(calculatedRange);
    } else {
      console.warn('유효하지 않은 기간:', period);
    }
  };

  /**
   * 날짜 범위 개별 필드 변경 핸들러
   * @param {string} field - 변경할 필드 ('startDate' 또는 'endDate')
   * @param {string} value - 새로운 날짜 값 (YYYY-MM-DD 형식)
   */
  const handleDateRangeChange = (field, value) => {
    console.log('날짜 범위 개별 변경:', field, value);
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 사용자 정의 기간 조회 실행
   * - 현재 설정된 dateRange로 조회 실행
   * - selectedPeriod를 'custom'으로 변경
   */
  const handleCustomSearch = () => {
    console.log('사용자 정의 기간 조회 실행:', dateRange);
    setSelectedPeriod('custom');
    // 실제 조회는 상위 컴포넌트에서 dateRange 변경을 감지하여 수행
  };

  return {
    selectedPeriod,    // 현재 선택된 기간 타입
    dateRange,         // 현재 날짜 범위 { startDate, endDate }
    handlePeriodChange,     // 기간 선택 변경 함수
    handleDateRangeChange,  // 개별 날짜 변경 함수
    handleCustomSearch      // 사용자 정의 조회 실행 함수
  };
};