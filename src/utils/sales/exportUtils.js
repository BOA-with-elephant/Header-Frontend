/**
 * 데이터 내보내기 유틸리티 모듈
 * 
 * 이 모듈은 매출 통계 데이터를 CSV 파일로 내보내는 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 브라우저에서 직접 CSV 파일 다운로드 (서버 없이)
 * - 한글 문자 깨짐 방지 (UTF-8 BOM 처리)
 * - 다양한 데이터 형식을 CSV로 변환
 * - 자동 파일명 생성 (날짜 포함)
 * 
 * 사용 목적:
 * - 매출 통계 리포트 백업
 * - Excel에서 추가 분석을 위한 데이터 제공
 * - 경영진 보고서 작성 지원
 * - 외부 시스템과의 데이터 연동
 * 
 * 설계 원칙:
 * - 클라이언트 사이드: 서버 요청 없이 즉시 다운로드
 * - 한글 지원: BOM 추가로 Excel에서 한글 정상 표시
 * - 메모리 효율: 다운로드 후 즉시 리소스 정리
 * - 사용자 친화적: 의미있는 파일명 자동 생성
 */

// ============================
// 핵심 CSV 내보내기 함수
// ============================

/**
 * 2차원 배열 데이터를 CSV 파일로 다운로드하는 함수
 * 
 * 처리 과정:
 * 1. 2차원 배열을 CSV 형식 문자열로 변환
 * 2. UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
 * 3. Blob 객체 생성 및 다운로드 URL 생성
 * 4. 임시 링크 요소 생성 및 클릭 시뮬레이션
 * 5. 리소스 정리 (메모리 누수 방지)
 * 
 * BOM (Byte Order Mark):
 * - '\uFEFF': UTF-8 BOM 문자
 * - Excel에서 CSV를 열 때 한글이 깨지지 않도록 보장
 * - 메모장이나 다른 텍스트 에디터에서도 정상 표시
 * 
 * 브라우저 호환성:
 * - Blob API: 모든 모던 브라우저 지원
 * - URL.createObjectURL: IE 10+ 지원
 * - 다운로드 속성: HTML5 표준
 * 
 * @param {Array<Array<string|number>>} data - CSV로 변환할 2차원 배열
 * @param {string} filename - 다운로드될 파일명 (.csv 확장자 포함 권장)
 * 
 * @example
 * // 기본 사용법
 * const reportData = [
 *   ['날짜', '매출액', '거래건수'],
 *   ['2024-07-01', 1500000, 45],
 *   ['2024-07-02', 1800000, 52]
 * ];
 * exportCSV(reportData, '매출통계_2024-07.csv');
 * 
 * @example
 * // 한글 데이터 포함
 * const categoryData = [
 *   ['카테고리', '매출액'],
 *   ['음료', 500000],
 *   ['디저트', 300000]
 * ];
 * exportCSV(categoryData, '카테고리별_매출.csv');
 */
export const exportCSV = (data, filename) => {
  // 1. 2차원 배열을 CSV 형식 문자열로 변환
  // 각 행의 요소들을 쉼표로 연결하고, 행들을 줄바꿈으로 연결
  const csvContent = data.map(row => row.join(',')).join('\n');
  
  // 2. UTF-8 BOM(Byte Order Mark) 추가
  // Excel에서 CSV 파일을 열 때 한글이 깨지지 않도록 보장
  const BOM = '\uFEFF';
  
  // 3. Blob 객체 생성 (브라우저에서 파일 데이터를 나타내는 객체)
  // type: CSV 파일임을 명시하고 UTF-8 인코딩 지정
  const blob = new Blob([BOM + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  // 4. 임시 다운로드 링크 요소 생성
  const link = document.createElement('a');
  
  // 5. Blob에서 다운로드 가능한 URL 생성
  const url = URL.createObjectURL(blob);
  
  // 6. 링크 요소 설정
  link.setAttribute('href', url);              // 다운로드 URL 설정
  link.setAttribute('download', filename);     // 다운로드 파일명 설정
  link.style.visibility = 'hidden';            // 화면에 표시하지 않음
  
  // 7. DOM에 임시 추가 후 클릭 시뮬레이션
  document.body.appendChild(link);
  link.click();                                // 다운로드 실행
  
  // 8. 리소스 정리 (메모리 누수 방지)
  document.body.removeChild(link);             // DOM에서 링크 제거
  URL.revokeObjectURL(url);                    // 메모리에서 URL 해제
};

// ============================
// 특화된 내보내기 함수들
// ============================

/**
 * 월별 분석 데이터를 CSV로 내보내는 전용 함수
 * MonthlyTrendChart의 데이터를 리포트 형태로 다운로드할 때 사용
 * 
 * 처리 기능:
 * - 월별 통계 데이터를 표 형태로 구조화
 * - 평균 거래액 자동 계산 (매출액 ÷ 거래건수)
 * - 날짜 기반 파일명 자동 생성
 * - 한글 헤더로 Excel에서 바로 사용 가능
 * 
 * 생성되는 CSV 구조:
 * | 월        | 매출액   | 거래건수 | 평균거래액 |
 * |-----------|----------|----------|------------|
 * | 2024년 7월| 15000000 | 450      | 33333      |
 * | 2024년 8월| 18000000 | 520      | 34615      |
 * 
 * 자동 계산:
 * - 평균거래액 = 매출액 ÷ 거래건수 (반올림)
 * - 0으로 나누기 방지: 거래건수가 0이면 0으로 처리
 * 
 * 파일명 형식: "월별분석_YYYY-MM-DD.csv"
 * 
 * @param {Array<Object>} data - 월별 분석 데이터 배열
 * @param {string} data[].label - 월 표시명 ("2024년 7월")
 * @param {number} data[].amount - 해당 월 매출액
 * @param {number} data[].count - 해당 월 거래건수
 * 
 * @example
 * // MonthlyTrendChart 데이터 내보내기
 * const monthlyData = [
 *   { label: '2024년 6월', amount: 15000000, count: 450 },
 *   { label: '2024년 7월', amount: 18000000, count: 520 }
 * ];
 * exportMonthlyAnalysis(monthlyData);
 * // 결과: "월별분석_2024-07-21.csv" 파일 다운로드
 * 
 * @example
 * // 리포트 다운로드 버튼에서 호출
 * const handleMonthlyReport = () => {
 *   exportMonthlyAnalysis(monthlyTrend.data);
 * };
 */
export const exportMonthlyAnalysis = (data) => {
  // CSV 데이터 구조 생성
  const csvContent = [
    // 헤더 행: Excel에서 바로 이해할 수 있는 한글 컬럼명
    ['월', '매출액', '거래건수', '평균거래액'],
    
    // 데이터 행들: 각 월별 통계를 행으로 변환
    ...data.map(stat => [
      stat.label,                                    // 월 표시명 (예: "2024년 7월")
      stat.amount,                                   // 매출액 (숫자 그대로, Excel에서 숫자 인식)
      stat.count,                                    // 거래건수
      stat.count > 0 ? Math.round(stat.amount / stat.count) : 0  // 평균거래액 (0 나누기 방지)
    ])
  ];
  
  // 현재 날짜를 파일명에 포함하여 CSV 다운로드 실행
  // toISOString().split('T')[0]: "2024-07-21T10:30:00.000Z" → "2024-07-21"
  const today = new Date().toISOString().split('T')[0];
  const filename = `월별분석_${today}.csv`;
  
  exportCSV(csvContent, filename);
};