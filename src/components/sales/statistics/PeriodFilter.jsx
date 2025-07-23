import React from 'react';
import { Filter, Download, Calendar } from './common/Icons';
import { PERIOD_BUTTONS } from '@/constants/sales/chartConfig';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

/**
 * 전체 통계 기간 필터 컴포넌트
 * 
 * 주요 기능:
 * - 전체 매출 통계 페이지의 메인 기간 필터 역할
 * - 프리셋 기간 버튼과 사용자 정의 날짜 입력 지원
 * - 현재 선택된 기간 정보 실시간 표시
 * - 리포트 다운로드 기능 통합 제공
 * - 모든 차트와 통계의 데이터 범위 통합 제어
 * 
 * 사용 패턴:
 * 1. 프리셋 선택: "오늘", "이번 달", "최근 3개월" 등 버튼 클릭
 * 2. 사용자 정의: "사용자 정의" 선택 → 시작/종료 날짜 입력 → 조회 버튼
 * 3. 리포트: 현재 기간 데이터를 CSV로 다운로드
 * 
 * 데이터 흐름:
 * PeriodFilter → useSalesData → useChartData → 모든 차트 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedPeriod - 현재 선택된 기간 키 ('today', 'month', 'custom' 등)
 * @param {Object} props.dateRange - 실제 적용된 날짜 범위
 * @param {string} props.dateRange.startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param {string} props.dateRange.endDate - 종료 날짜 (YYYY-MM-DD 형식)
 * @param {Function} props.onPeriodChange - 프리셋 기간 변경 콜백 (periodKey) => void
 * @param {Function} props.onDateRangeChange - 개별 날짜 변경 콜백 (field, value) => void
 * @param {Function} props.onCustomSearch - 사용자 정의 기간 조회 실행 콜백 () => void
 * @param {Function} props.onReportDownload - 리포트 다운로드 실행 콜백 () => void
 */
const PeriodFilter = ({ 
  selectedPeriod, 
  dateRange, 
  onPeriodChange, 
  onDateRangeChange, 
  onCustomSearch, 
  onReportDownload 
}) => {
  return (
    <div className={styles.filterSection}>
      
      {/* 필터 헤더 - 제목과 리포트 다운로드 버튼 */}
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>
          {/* 필터 아이콘과 제목 */}
          <Filter className="w-5 h-5" />
          전체 통계 기간 설정
        </h2>
        
        {/* 리포트 다운로드 버튼 - 현재 필터 기간의 데이터를 CSV로 내보내기 */}
        <button className={styles.downloadButton} onClick={onReportDownload}>
          <Download className="w-4 h-4" />
          리포트 다운로드
        </button>
      </div>

      {/* 프리셋 기간 선택 버튼들 */}
      <div className={styles.periodButtonsContainer}>
        {/* PERIOD_BUTTONS 상수에서 정의된 기간 옵션들을 버튼으로 렌더링 */}
        {PERIOD_BUTTONS.map(button => (
          <button
            key={button.key}                                    // 고유 키 (예: 'today', 'month')
            onClick={() => onPeriodChange(button.key)}          // 클릭 시 해당 기간으로 변경
            className={`${styles.periodButton} ${
              selectedPeriod === button.key ? styles.active : ''  // 현재 선택된 버튼 강조 표시
            }`}
          >
            {button.label}                                      {/* 사용자에게 표시되는 텍스트 */}
          </button>
        ))}
        {/* 
          PERIOD_BUTTONS 예시:
          [
            { key: 'today', label: '오늘' },
            { key: 'yesterday', label: '어제' },
            { key: 'week', label: '일주일' },
            { key: 'month', label: '이번 달' },
            { key: 'custom', label: '사용자 정의' }
          ]
        */}
      </div>

      {/* 사용자 정의 날짜 입력 영역 - '사용자 정의' 선택 시에만 표시 */}
      {selectedPeriod === 'custom' && (
        <div className={styles.filterGrid}>
          
          {/* 시작 날짜 입력 그룹 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>시작 날짜</label>
            <input
              type="date"                                       // HTML5 날짜 입력 타입
              value={dateRange.startDate}                       // 현재 시작 날짜 값
              onChange={(e) => onDateRangeChange('startDate', e.target.value)} // 값 변경 시 콜백
              className={styles.dateInput}
            />
          </div>
          
          {/* 종료 날짜 입력 그룹 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>종료 날짜</label>
            <input
              type="date"                                       // HTML5 날짜 입력 타입
              value={dateRange.endDate}                         // 현재 종료 날짜 값
              onChange={(e) => onDateRangeChange('endDate', e.target.value)} // 값 변경 시 콜백
              className={styles.dateInput}
            />
          </div>
          
          {/* 조회 실행 버튼 그룹 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>적용</label>
            <button
              onClick={onCustomSearch}                          // 사용자 정의 기간으로 조회 실행
              className={styles.searchButton}
            >
              조회
            </button>
          </div>
        </div>
      )}

      {/* 현재 조회 기간 정보 표시 영역 */}
      <div className={styles.periodInfo}>
        {/* 달력 아이콘 */}
        <Calendar className={styles.periodIcon} />
        
        {/* 현재 적용된 날짜 범위 표시 */}
        <span>현재 조회 기간: {dateRange.startDate} ~ {dateRange.endDate}</span>
      </div>
    </div>
  );
};

export default PeriodFilter;