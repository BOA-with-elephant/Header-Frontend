import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartFilter from '../common/ChartFilter';
import { PIE_CHART_OPTIONS } from '@/constants/sales/chartConfig';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

// Chart.js 플러그인 등록
// 파이 차트 렌더링에 필요한 핵심 요소들
ChartJS.register(
  ArcElement,  // 호 모양 요소 (파이 차트의 각 조각)
  Title,       // 차트 제목
  Tooltip,     // 마우스 호버 시 표시되는 툴팁
  Legend       // 범례 (결제 방법별 색상 표시)
);

/**
 * 결제 방법별 매출 통계 파이 차트 컴포넌트
 * 
 * 주요 기능:
 * - 결제 방법별 매출 금액을 파이 차트로 시각화
 * - 각 결제 방법마다 고유한 색상으로 구분 (신용카드: 빨강, 현금: 청록색 등)
 * - 기간별 필터링 지원 (오늘, 어제, 일주일, 한달 등)
 * - 로딩 상태 및 빈 데이터 상태 처리
 * - 결제 트렌드 분석 및 주요 결제 수단 파악 용도
 * 
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터 객체
 * @param {boolean} props.data.loading - 데이터 로딩 상태
 * @param {Array} props.data.data - 결제 방법별 매출 데이터 배열
 * @param {string} props.data.period - 현재 선택된 필터링 기간
 * @param {Function} props.onFilterChange - 필터 변경 시 호출되는 콜백 함수
 */
const PaymentMethodChart = ({ data, onFilterChange }) => {
  
  /**
   * 결제 방법별 고유 색상 할당 함수
   * 결제 방법에 따라 직관적이고 구분하기 쉬운 색상을 반환
   * 
   * 색상 기준:
   * - 신용카드/카드결제: 빨간색 계열 (위험/중요성 표현)
   * - 현금/현금결제: 청록색 계열 (안정성 표현)
   * - 계좌이체: 파란색 계열 (신뢰성 표현)
   * - 모바일결제: 초록색 계열 (혁신성 표현)
   * - 상품권: 노란색 계열 (특별함 표현)
   * - 기타: 보라색 계열 (중립적 표현)
   * 
   * @param {string} method - 결제 방법명
   * @param {number} index - 배열 인덱스 (현재 미사용, 향후 확장성을 위해 유지)
   * @returns {string} HEX 색상 코드
   */
  const getPaymentMethodColor = (method, index) => {
    const colorMap = {
      '신용카드': '#FF6B6B',    // 빨간색 - 가장 일반적인 결제 수단
      '카드결제': '#FF6B6B',    // 빨간색 - 신용카드와 동일 (동의어)
      '현금': '#4ECDC4',        // 청록색 - 전통적이고 안전한 결제
      '현금결제': '#4ECDC4',    // 청록색 - 현금과 동일 (동의어)
      '계좌이체': '#45B7D1',    // 파란색 - 은행 거래의 신뢰성
      '모바일결제': '#96CEB4',  // 연두색 - 현대적이고 편리한 결제
      '상품권': '#FFEAA7',      // 노란색 - 특별한 형태의 결제
      '기타': '#DDA0DD'         // 연보라색 - 분류되지 않은 결제 방법
    };
    
    // 매핑된 색상이 있으면 반환, 없으면 기타 색상 반환
    return colorMap[method] || colorMap['기타'];
  };

  /**
   * Chart.js용 데이터 구조 생성
   * 
   * 데이터 구조:
   * - labels: 각 조각에 표시될 결제 방법명 배열
   * - datasets: 차트 데이터셋 (색상, 값 등 포함)
   */
  const chartData = {
    // 결제 방법명 배열 생성 (예: ['신용카드', '현금', '모바일결제'])
    labels: data.data.map(stat => stat.method),
    
    datasets: [{
      // 각 결제 방법의 매출 금액 배열
      data: data.data.map(stat => stat.amount),
      
      // 각 조각의 배경 색상 (결제 방법별 고유 색상 적용)
      backgroundColor: data.data.map((stat, index) => 
        getPaymentMethodColor(stat.method, index)
      ),
      
      // 각 조각의 테두리 색상 (배경색과 동일하게 설정)
      borderColor: data.data.map((stat, index) => 
        getPaymentMethodColor(stat.method, index)
      ),
      
      // 테두리 두께 (조각 간 구분을 위한 선 굵기)
      borderWidth: 2,
    }]
  };

  /**
   * 필터 옵션 정의
   * 결제 방법 분석에 적합한 기간별 필터 목록
   * 일반적으로 짧은 기간부터 긴 기간 순으로 정렬
   */
  const filterOptions = [
    { value: 'all', label: '전체' },              // 모든 데이터 (전체 기간)
    { value: 'yesterday', label: '어제' },        // 어제 하루
    { value: 'today', label: '오늘' },            // 오늘 하루
    { value: 'week', label: '일주일' },           // 최근 7일
    { value: 'month', label: '한달' },            // 최근 30일
    { value: 'last3months', label: '최근 3개월' }, // 최근 90일
    { value: 'lastYear', label: '작년' }      // 작년
  ];

  return (
    <div className={styles.chartCard}>
      {/* 차트 헤더 영역 - 제목과 필터 */}
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>결제 방법별 매출</h3>
        
        {/* 기간 필터 드롭다운 */}
        <ChartFilter
          title="기간"                    // 필터 라벨
          value={data.period}            // 현재 선택된 값
          options={filterOptions}        // 선택 가능한 옵션들
          onChange={onFilterChange}      // 값 변경 시 콜백
        />
      </div>
      
      {/* 차트 렌더링 영역 */}
      <div style={{ height: '300px' }}>
        {data.loading ? (
          // 로딩 상태: 데이터를 불러오는 중
          <div className={styles.chartLoading}>로딩 중...</div>
        ) : data.data.length > 0 ? (
          // 정상 상태: 데이터가 있을 때 파이 차트 렌더링
          <Pie 
            data={chartData}              // 차트 데이터
            options={PIE_CHART_OPTIONS}   // 차트 설정 옵션 (공통 파이 차트 옵션)
          />
        ) : (
          // 빈 데이터 상태: 선택된 기간에 결제 데이터가 없음
          <div className={styles.noData}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodChart;