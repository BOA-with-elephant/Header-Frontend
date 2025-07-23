import React from 'react';
import ChartFilter from '../common/ChartFilter';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

/**
 * 결제 상태별 통계 컴포넌트
 * 
 * 주요 기능:
 * - 결제 상태별 건수와 비율을 카드 형태로 시각화
 * - 각 상태마다 고유한 색상의 진행률 바 표시
 * - 기간별 필터링 지원으로 시점별 결제 상태 분석
 * - Chart.js 없이 순수 CSS로 구현한 커스텀 차트
 * - 결제 성공률, 실패율, 취소율 등 핵심 지표 제공
 * 
 * 표시 정보:
 * - 상태명 (완료, 대기, 취소, 실패 등)
 * - 해당 상태의 비율 (%)
 * - 전체 대비 진행률 바 (색상으로 구분)
 * - 실제 건수 (N건)
 * 
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터 객체
 * @param {boolean} props.data.loading - 데이터 로딩 상태 (현재 컴포넌트에서 직접 처리하지 않음)
 * @param {Array} props.data.data - 결제 상태별 통계 데이터 배열
 * @param {string} props.data.period - 현재 선택된 필터링 기간
 * @param {Function} props.onFilterChange - 필터 변경 시 호출되는 콜백 함수
 */
const StatusStatsChart = ({ data, onFilterChange }) => {
  
  /**
   * 필터 옵션 정의
   * 결제 상태 분석에 적합한 기간별 필터 목록
   * 
   * 결제 상태 분석 관점:
   * - 단기 (오늘, 어제): 실시간 결제 상태 모니터링
   * - 중기 (일주일, 한달): 결제 시스템 안정성 추적
   * - 장기 (3개월, 1년): 결제 성공률 트렌드 분석
   */
  const filterOptions = [
    { value: 'all', label: '전체' },              // 전체 기간 데이터 (시스템 전체 성능)
    { value: 'yesterday', label: '어제' },        // 어제의 결제 상태 분포
    { value: 'today', label: '오늘' },            // 실시간 결제 상태 모니터링
    { value: 'week', label: '일주일' },           // 주간 결제 시스템 성능
    { value: 'month', label: '한달' },            // 월간 결제 안정성 지표
    { value: 'last3months', label: '최근 3개월' }, // 분기별 결제 품질 추이
    { value: 'lastYear', label: '작년' }      // 연간 결제 시스템 신뢰도
  ];

  const hasData = data.data && data.data.length > 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>결제 상태별 통계</h3>

        <ChartFilter
          title="기간"
          value={data.period}
          options={filterOptions}
          onChange={onFilterChange}
        />
      </div>

      {hasData ? (
        <div className={styles.statusGrid}>
          {data.data.map((stat) => (
            <div key={stat.status} className={styles.statusCard}>
              <div className={styles.statusCardHeader}>
                <span className={styles.statusCardTitle}>{stat.status}</span>
                <span className={styles.statusCardPercentage}>{stat.percentage}%</span>
              </div>
              <div className={styles.statusProgressBar}>
                <div
                  className={styles.statusProgress}
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color
                  }}
                />
              </div>
              <div className={styles.statusCardCount}>
                <span className={styles.statusCount}>{stat.count}건</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={styles.noData}
          style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}
        >
          선택한 기간에 대한 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default StatusStatsChart;