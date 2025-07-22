import React from 'react';
import { Doughnut } from 'react-chartjs-2';
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
// 도넛 차트 렌더링에 필요한 핵심 요소들
ChartJS.register(
  ArcElement,  // 호 모양 요소 (도넛 차트의 각 조각)
  Title,       // 차트 제목
  Tooltip,     // 마우스 호버 시 표시되는 툴팁
  Legend       // 범례 (카테고리별 색상 표시)
);

/**
 * 카테고리별 매출 통계 도넛 차트 컴포넌트
 * 
 * 주요 기능:
 * - 카테고리별 매출 금액을 도넛 차트로 시각화
 * - 각 카테고리마다 고유한 색상으로 구분
 * - 기간별 필터링 지원 (오늘, 어제, 이번달, 최근 3개월 등)
 * - 로딩 상태 및 빈 데이터 상태 처리
 * 
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터 객체
 * @param {boolean} props.data.loading - 데이터 로딩 상태
 * @param {Array} props.data.data - 카테고리별 매출 데이터 배열
 * @param {string} props.data.period - 현재 선택된 필터링 기간
 * @param {Function} props.onFilterChange - 필터 변경 시 호출되는 콜백 함수
 */
const CategoryStatsChart = ({ data, onFilterChange }) => {
  /**
   * Chart.js용 데이터 구조 생성
   * 
   * 데이터 구조:
   * - labels: 각 조각에 표시될 카테고리명 배열
   * - datasets: 차트 데이터셋 (색상, 값 등 포함)
   */
  const chartData = {
    // 카테고리명 배열 생성 (예: ['음료', '디저트', '메인메뉴'])
    labels: data.data.map(stat => stat.category),
    
    datasets: [{
      // 각 카테고리의 매출 금액 배열
      data: data.data.map(stat => stat.amount),
      
      // 각 조각의 배경 색상 (카테고리별 고유 색상)
      backgroundColor: data.data.map(stat => stat.color),
      
      // 각 조각의 테두리 색상 (배경색과 동일)
      borderColor: data.data.map(stat => stat.color),
      
      // 테두리 두께 (조각 간 구분을 위한 선 굵기)
      borderWidth: 2,
    }]
  };

  /**
   * 필터 옵션 정의
   * 사용자가 선택할 수 있는 기간별 필터 목록
   */
  const filterOptions = [
    { value: 'thisMonth', label: '이번달' },      // 현재 월의 1일부터 오늘까지
    { value: 'all', label: '전체' },              // 모든 데이터
    { value: 'yesterday', label: '어제' },        // 어제 하루
    { value: 'today', label: '오늘' },            // 오늘 하루
    { value: 'week', label: '일주일' },           // 최근 7일
    { value: 'month', label: '최근 1개월' },      // 최근 30일
    { value: 'last3months', label: '최근 3개월' }, // 최근 90일
    { value: 'lastYear', label: '작년' }      // 작년
  ];

  return (
    <div className={styles.chartCard}>
      {/* 차트 헤더 영역 - 제목과 필터 */}
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>카테고리별 매출</h3>
        
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
          // 정상 상태: 데이터가 있을 때 도넛 차트 렌더링
          <Doughnut 
            data={chartData}           // 차트 데이터
            options={PIE_CHART_OPTIONS} // 차트 설정 옵션
          />
        ) : (
          // 빈 데이터 상태: 선택된 기간에 매출 데이터가 없음
          <div className={styles.noData}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default CategoryStatsChart;