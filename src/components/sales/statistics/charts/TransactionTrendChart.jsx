import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartFilter from '../common/ChartFilter';
import { DEFAULT_CHART_OPTIONS } from '@/constants/sales/chartConfig';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

// Chart.js 플러그인 등록
// 막대 차트 렌더링에 필요한 핵심 요소들
ChartJS.register(
  CategoryScale,  // X축 카테고리 스케일 (시간 단위별 라벨)
  LinearScale,    // Y축 선형 스케일 (거래 건수)
  BarElement,     // 막대 요소 (각각의 데이터 바)
  Title,          // 차트 제목
  Tooltip,        // 마우스 호버 툴팁
  Legend          // 범례 (데이터셋 설명)
);

/**
 * 거래 건수 추이 막대 차트 컴포넌트
 * 
 * 주요 기능:
 * - 시간별 거래 건수를 막대 차트로 시각화
 * - 다중 필터 시스템: 집계 단위(일별/주별/월별) + 조회 기간 조합
 * - 단위 변경 시 적절한 기본 기간으로 자동 설정
 * - 단위별로 적합한 기간 옵션만 표시하는 동적 필터링
 * - 거래량 패턴 분석을 통한 비즈니스 인사이트 제공
 * 
 * 분석 용도:
 * - 일별: 요일별 거래 패턴, 특정 날짜 이벤트 효과 분석
 * - 주별: 월간 거래 흐름, 주단위 마케팅 캠페인 효과 측정
 * - 월별: 계절성 분석, 장기 성장 추이 파악
 * 
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터 객체
 * @param {boolean} props.data.loading - 데이터 로딩 상태
 * @param {Array} props.data.data - 시간별 거래 건수 데이터 배열
 * @param {string} props.data.unit - 현재 선택된 집계 단위 ('daily', 'weekly', 'monthly')
 * @param {string} props.data.period - 현재 선택된 조회 기간
 * @param {Function} props.onFilterChange - 필터 변경 시 호출되는 콜백 함수 (unit, period)
 */
const TransactionTrendChart = ({ data, onFilterChange }) => {
  
  /**
   * Chart.js용 데이터 구조 생성
   * 막대 차트로 시간별 거래 건수를 표현
   */
  const chartData = {
    // X축 라벨 생성 (시간 단위별 표시명)
    // displayLabel이 있으면 사용, 없으면 period 사용
    labels: data.data.map(stat => stat.displayLabel || stat.period),
    
    datasets: [{
      label: '거래 건수',              // 데이터셋 라벨 (범례에 표시)
      data: data.data.map(stat => stat.count),  // Y축 데이터 (거래 건수)
      backgroundColor: '#3B82F6',     // 막대 배경색 (파란색)
      borderColor: '#3B82F6',         // 막대 테두리색 (배경색과 동일)
      borderWidth: 2,                 // 테두리 두께
    }]
  };

  /**
   * 집계 단위별 적절한 기간 옵션 반환 함수
   * 각 단위에 맞는 의미 있는 기간만 제공하여 사용자 경험 향상
   * 
   * 설계 원칙:
   * - 일별: 짧은 기간 (어제~최근 3개월) - 세부 패턴 분석용
   * - 주별: 중간 기간 (한달~작년) - 월간/분기 트렌드용  
   * - 월별: 긴 기간 (최근 3개월~올해) - 장기 추이 분석용
   * 
   * @param {string} unit - 집계 단위 ('daily', 'weekly', 'monthly')
   * @returns {Array} 해당 단위에 적합한 기간 옵션 배열
   */
  const getPeriodOptions = (unit) => {
    // 모든 기간 옵션 정의
    const baseOptions = [
      { value: 'yesterday', label: '어제' },        // 1일
      { value: 'today', label: '오늘' },            // 1일
      { value: 'week', label: '일주일' },           // 7일
      { value: 'month', label: '한달' },            // 30일
      { value: 'last3months', label: '최근 3개월' }, // 90일
      { value: 'lastyear', label: '작년' }          // 작년
    ];

    // 집계 단위별로 적절한 옵션만 필터링
    switch (unit) {
      case 'daily':
        // 일별 분석: 세밀한 패턴 분석을 위한 단기 옵션
        return baseOptions;
        
      case 'weekly':
        // 주별 분석: 월간/분기 트렌드 파악을 위한 중기 옵션
        return [
          { value: 'month', label: '한달' },          // 4~5주 데이터
          { value: 'last3months', label: '최근 3개월' }, // 12~13주 데이터
          { value: 'lastYear', label: '작년' }        // 52주 데이터
        ];
        
      case 'monthly':
        // 월별 분석: 장기 추이 파악을 위한 장기 옵션
        return [
          { value: 'last3months', label: '최근 3개월' }, // 3개월 데이터
          { value: 'lastYear', label: '작년' },        // 12개월 데이터
          { value: 'thisYear', label: '올해' }         // 현재까지 월별 데이터
        ];
        
      default:
        // 안전장치: 기본적으로 모든 옵션 제공
        return baseOptions;
    }
  };

  /**
   * 집계 단위 변경 핸들러
   * 단위 변경 시 해당 단위에 가장 적합한 기본 기간으로 자동 설정
   * 
   * 기본 기간 선택 기준:
   * - 일별: '한달' - 30일간의 일별 패턴을 보기에 적당한 데이터량
   * - 주별: '최근 3개월' - 12주 정도의 주별 트렌드 파악에 적절
   * - 월별: '올해' - 연간 월별 변화를 보기에 가장 일반적
   * 
   * @param {string} newUnit - 새로 선택된 집계 단위
   */
  const handleUnitChange = (newUnit) => {
    let newPeriod;

    // 새로운 단위에 맞는 '기본 기간'을 명시적으로 설정
    // 이전 기간 값에 상관없이 새로운 단위에 맞는 기간으로 초기화
    switch (newUnit) {
      case 'daily':
        newPeriod = 'month';        // 일별 기본값: 한달 (약 30개 데이터 포인트)
        break;
      case 'weekly':
        newPeriod = 'last3months';  // 주별 기본값: 최근 3개월 (약 12개 데이터 포인트)
        break;
      case 'monthly':
        newPeriod = 'thisYear';     // 월별 기본값: 올해 (최대 12개 데이터 포인트)
        break;
      default:
        newPeriod = 'month';        // 안전을 위한 기본값
    }

    // 상위 컴포넌트에 단위와 기간을 함께 전달
    onFilterChange(newUnit, newPeriod);
  };

  return (
    <div className={styles.chartCard}>
      {/* 차트 헤더 영역 - 제목과 다중 필터 */}
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>거래 건수 추이</h3>
        
        {/* 다중 필터 컨테이너 - 단위 선택과 기간 선택을 나란히 배치 */}
        <div className={styles.multiFilter}>
          
          {/* 집계 단위 선택 필터 */}
          <ChartFilter
            title="단위"                        // 필터 라벨
            value={data.unit}                  // 현재 선택된 집계 단위
            options={[
              { value: 'daily', label: '일별' },    // 하루 단위 집계
              { value: 'weekly', label: '주별' },   // 주 단위 집계  
              { value: 'monthly', label: '월별' }   // 월 단위 집계
            ]}
            onChange={handleUnitChange}        // 단위 변경 시 기본 기간도 함께 설정
            className={styles.halfWidth}       // 절반 너비 스타일
          />
          
          {/* 조회 기간 선택 필터 */}
          <ChartFilter
            title="기간"                             // 필터 라벨
            value={data.period}                     // 현재 선택된 조회 기간
            options={getPeriodOptions(data.unit)}   // 현재 단위에 적합한 기간 옵션들
            onChange={(period) => onFilterChange(data.unit, period)} // 기간만 변경
            className={styles.halfWidth}            // 절반 너비 스타일
          />
        </div>
      </div>
      
      {/* 차트 렌더링 영역 */}
      <div style={{ height: '300px' }}>
        {data.loading ? (
          // 로딩 상태: 데이터 처리 중
          <div className={styles.chartLoading}>로딩 중...</div>
        ) : data.data.length > 0 ? (
          // 정상 상태: 막대 차트 렌더링
          <Bar 
            data={chartData}                    // 차트 데이터
            options={DEFAULT_CHART_OPTIONS}     // 기본 차트 옵션 사용
          />
        ) : (
          // 빈 데이터 상태: 선택된 조건에 데이터가 없음
          <div className={styles.noData}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default TransactionTrendChart;