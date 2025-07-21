import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import ChartFilter from '../common/ChartFilter';
import { DEFAULT_CHART_OPTIONS } from '@/constants/sales/chartConfig';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

// Chart.js 플러그인 등록
// 라인 차트 렌더링에 필요한 모든 구성 요소들
ChartJS.register(
  CategoryScale,  // X축 카테고리 스케일 (월별 라벨)
  LinearScale,    // Y축 선형 스케일 (금액)
  LineElement,    // 라인 요소 (연결선)
  PointElement,   // 포인트 요소 (데이터 점)
  Title,          // 차트 제목
  Tooltip,        // 마우스 호버 툴팁
  Legend,         // 범례 (데이터셋 구분)
  Filler          // 영역 채우기 (fill 옵션 지원)
);

/**
 * 월별 매출 추이 라인 차트 컴포넌트
 * 
 * 주요 기능:
 * - 월별 총 매출액, 취소 금액, 순 매출액을 3개 라인으로 시각화
 * - 기간별 필터링 지원 (최근 12개월, 올해, 작년, 특정 연도)
 * - 범례 클릭으로 라인 숨기기/보이기 토글
 * - 데이터 포인트 호버 시 상세 정보 표시
 * - 로딩/에러 상태 처리 및 디버깅 정보 출력
 * 
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터 객체
 * @param {boolean} props.data.loading - 데이터 로딩 상태
 * @param {Array} props.data.data - 월별 매출 데이터 배열
 * @param {string} props.data.period - 현재 선택된 필터링 기간
 * @param {Function} props.onFilterChange - 필터 변경 시 호출되는 콜백 함수
 */
const MonthlyTrendChart = ({ data, onFilterChange }) => {
  // 디버깅 로그 - 개발 환경에서 데이터 흐름 추적용
  console.log('MonthlyTrendChart - 받은 data:', data);
  console.log('MonthlyTrendChart - data.data:', data?.data);
  console.log('MonthlyTrendChart - data.data.length:', data?.data?.length);
  console.log('MonthlyTrendChart - data.loading:', data?.loading);
  console.log('MonthlyTrendChart - data.period:', data?.period);

  /**
   * 필터 옵션 동적 생성 함수
   * 현재 연도를 기준으로 선택 가능한 기간 옵션들을 생성
   * 
   * @returns {Array} 필터 옵션 배열
   */
  const generateFilterOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [
      { value: 'thisYear', label: '올해' },           // 현재 연도 1월~현재
      { value: 'lastYear', label: '작년' }            // 지난 연도 전체
    ];
    
    // 과거 연도들을 동적으로 추가 (2024년부터 현재-2년까지)
    // 예: 2025년이면 2024년까지, 2026년이면 2024년까지 추가
    for (let year = 2024; year <= currentYear - 2; year++) {
      options.splice(-2, 0, { value: `year${year}`, label: `${year}년` });
    }
    
    return options;
  };

  // === 에러 상태 처리 ===
  
  /**
   * 데이터 객체 자체가 없는 경우 (초기 로딩 중)
   * API 호출이 아직 완료되지 않았거나 props 전달에 문제가 있는 상태
   */
  if (!data) {
    console.log('MonthlyTrendChart - data가 undefined');
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>월별 매출 추이</h3>
        </div>
        <div style={{ height: '350px' }}>
          <div className={styles.noData}>데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  /**
   * 데이터 구조가 잘못된 경우
   * data 객체는 있지만 data.data 배열이 없는 상태
   */
  if (!data.data) {
    console.log('MonthlyTrendChart - data.data가 undefined');
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>월별 매출 추이</h3>
          <ChartFilter
            title="기간"
            value={data.period}
            options={generateFilterOptions()}
            onChange={onFilterChange}
          />
        </div>
        <div style={{ height: '350px' }}>
          <div className={styles.noData}>데이터 구조 오류</div>
        </div>
      </div>
    );
  }

  // === Chart.js 데이터 구조 생성 ===
  
  /**
   * Chart.js가 요구하는 데이터 형식으로 변환
   * 3개의 라인을 그리기 위한 datasets 구성
   */
  const chartData = {
    // X축 라벨 생성 (예: "2024년 1월", "2024년 2월")
    labels: data.data.map(stat => {
      console.log('차트 라벨 생성 중 - stat:', stat);
      return stat.label;
    }),
    
    datasets: [
      // 첫 번째 라인: 총 매출액 (취소 포함)
      {
        label: '총 매출액',
        data: data.data.map(stat => {
          console.log('총 매출액 데이터 - stat.totalAmount:', stat.totalAmount);
          return stat.totalAmount;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // 파란색 반투명 채움
        borderColor: 'rgb(59, 130, 246)',           // 파란색 라인
        borderWidth: 3,                             // 라인 굵기
        tension: 0.4,                               // 곡선 정도 (0=직선, 1=매우 곡선)
        fill: true,                                 // 라인 아래 영역 채우기
        pointRadius: 5,                             // 데이터 포인트 크기
        pointHoverRadius: 8,                        // 호버 시 포인트 크기
      },
      
      // 두 번째 라인: 취소 금액
      {
        label: '취소 금액',
        data: data.data.map(stat => {
          console.log('취소 금액 데이터 - stat.cancelAmount:', stat.cancelAmount);
          return stat.cancelAmount;
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.1)',  // 빨간색 반투명
        borderColor: 'rgb(239, 68, 68)',            // 빨간색 라인
        borderWidth: 3,
        tension: 0.4,
        fill: false,                                // 채우기 없음 (라인만)
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      
      // 세 번째 라인: 순 매출액 (총 매출 - 취소)
      {
        label: '순 매출액',
        data: data.data.map(stat => {
          console.log('순 매출액 데이터 - stat.netSalesAmount:', stat.netSalesAmount);
          return stat.netSalesAmount;
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // 초록색 반투명
        borderColor: 'rgb(16, 185, 129)',           // 초록색 라인
        borderWidth: 3,
        tension: 0.4,
        fill: false,                                // 채우기 없음
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ]
  };

  // === Chart.js 옵션 설정 ===
  
  /**
   * 차트 표시 옵션 구성
   * 기본 옵션에 월별 추이 차트 전용 설정 추가
   */
  const chartOptions = {
    ...DEFAULT_CHART_OPTIONS, // 공통 차트 옵션 상속
    
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      
      // 범례 설정 (차트 상단의 라인 구분 표시)
      legend: {
        position: 'top',           // 차트 위쪽에 표시
        display: true,             // 범례 표시
        labels: {
          usePointStyle: true,     // 점 스타일 사용 (라인 대신 원형)
          padding: 20,             // 범례 항목 간 간격
          font: {
            size: 12               // 폰트 크기
          }
        },
        // 범례 클릭 시 해당 라인 숨기기/보이기 토글
        onClick: (event, legendItem, legend) => {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);
          
          // 현재 숨김 상태를 반전
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update(); // 차트 다시 그리기
        }
      },
      
      // 툴팁 설정 (마우스 호버 시 표시되는 정보)
      tooltip: {
        mode: 'index',             // 같은 X축 위치의 모든 데이터 표시
        intersect: false,          // 정확히 라인 위에 있지 않아도 표시
        callbacks: {
          // 툴팁 라벨 포맷팅 (금액에 천 단위 구분자 추가)
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}원`;
          }
        }
      }
    },
    
    // 마우스 상호작용 설정
    interaction: {
      mode: 'nearest',           // 가장 가까운 데이터 포인트 기준
      axis: 'x',                 // X축 기준으로 상호작용
      intersect: false           // 정확한 포인트 위가 아니어도 반응
    }
  };

  // 최종 차트 데이터 로그 출력
  console.log('MonthlyTrendChart - 최종 chartData:', chartData);

  // === 컴포넌트 렌더링 ===
  
  return (
    <div className={styles.chartCard}>
      {/* 차트 헤더 - 제목과 필터 */}
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>월별 매출 추이</h3>
        
        {/* 기간 필터 드롭다운 */}
        <ChartFilter
          title="기간"                        // 필터 라벨
          value={data.period}                // 현재 선택된 기간
          options={generateFilterOptions()}   // 동적 생성된 옵션들
          onChange={onFilterChange}          // 필터 변경 콜백
        />
      </div>
      
      {/* 차트 렌더링 영역 (고정 높이) */}
      <div style={{ height: '350px' }}>
        {data.loading ? (
          // 로딩 상태: 데이터 처리 중
          <div className={styles.chartLoading}>로딩 중...</div>
          
        ) : data.data.length > 0 ? (
          // 정상 상태: 라인 차트 렌더링
          <Line data={chartData} options={chartOptions} />
          
        ) : (
          // 빈 데이터 상태: 선택된 기간에 데이터가 없음
          <div className={styles.noData}>
            <div>데이터가 없습니다.</div>
            
            {/* 디버깅 정보 표시 (개발 환경용) */}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              디버깅 정보: 
              <br />data.data.length: {data.data?.length || 0}
              <br />data.period: {data.period}
              <br />data.loading: {String(data.loading)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTrendChart;