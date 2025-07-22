import React from 'react';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

/**
 * 차트 필터 공통 컴포넌트
 * 
 * 주요 기능:
 * - 모든 차트에서 공통으로 사용되는 드롭다운 필터 UI
 * - 라벨과 셀렉트 박스를 조합한 일관된 필터 디자인
 * - 동적 옵션 지원으로 다양한 필터 타입 처리 가능
 * - 커스텀 스타일링을 위한 className 확장 지원
 * 
 * 사용 사례:
 * - 기간 필터: "기간", "단위" 등의 시간 관련 필터
 * - 카테고리 필터: 데이터 분류를 위한 옵션 선택
 * - 정렬 필터: 데이터 표시 순서 변경
 * - 그룹핑 필터: 데이터 집계 방식 선택
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 필터 라벨에 표시될 제목 (예: "기간", "단위", "카테고리")
 * @param {string} props.value - 현재 선택된 값 (option.value와 매칭)
 * @param {Array} props.options - 선택 가능한 옵션들의 배열
 * @param {string} props.options[].value - 옵션의 실제 값 (onChange로 전달)
 * @param {string} props.options[].label - 사용자에게 표시될 옵션 텍스트
 * @param {Function} props.onChange - 값 변경 시 호출되는 콜백 함수
 * @param {string} [props.className=""] - 추가 CSS 클래스 (선택사항, 기본값: 빈 문자열)
 * 
 * @example
 * // 기간 필터 사용 예시
 * <ChartFilter
 *   title="기간"
 *   value="month"
 *   options={[
 *     { value: 'today', label: '오늘' },
 *     { value: 'week', label: '일주일' },
 *     { value: 'month', label: '한달' }
 *   ]}
 *   onChange={(newValue) => handlePeriodChange(newValue)}
 *   className="customFilter"
 * />
 */
const ChartFilter = ({ title, value, options, onChange, className = "" }) => (
  <div className={`${styles.chartFilter} ${className}`}>
    {/* 필터 라벨 - 필터의 목적을 명시 */}
    <label className={styles.filterLabel}>{title}</label>
    
    {/* 선택 드롭다운 */}
    <select 
      value={value}                           // 현재 선택된 값 (제어 컴포넌트)
      onChange={(e) => onChange(e.target.value)} // 값 변경 시 상위로 전달
      className={styles.filterSelect}        // 필터 전용 스타일 적용
    >
      {/* 옵션 목록 동적 생성 */}
      {options.map((option, index) => (
        <option 
          key={`${option.value}-${index}`}    // 고유 키 생성 (값 + 인덱스 조합)
          value={option.value}               // 실제 전달될 값
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default ChartFilter;