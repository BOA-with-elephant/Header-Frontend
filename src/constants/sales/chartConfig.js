/**
 * 매출 통계 차트 설정 상수 파일
 * 
 * 이 파일은 매출 통계 시스템 전체에서 사용되는 모든 차트 관련 설정과 상수를 중앙 관리합니다.
 * 
 * 주요 구성 요소:
 * - 기간 필터 버튼 설정
 * - Chart.js 기본 옵션 및 스타일
 * - 색상 팔레트 및 테마
 * - 결제 방법, 상태별 색상 매핑
 * - 유틸리티 함수들
 * 
 * 장점:
 * - 일관성: 모든 차트가 동일한 스타일과 설정 사용
 * - 유지보수성: 한 곳에서 모든 설정 변경 가능
 * - 확장성: 새로운 차트나 기능 추가 시 쉽게 확장
 * - 재사용성: 공통 설정을 여러 컴포넌트에서 재사용
 */

// ============================
// 기간 필터 설정
// ============================

/**
 * 전체 통계 기간 선택 버튼 배열
 * PeriodFilter 컴포넌트에서 사용되는 프리셋 기간 옵션들
 * 
 * 각 버튼 객체 구조:
 * - key: 내부 식별자 (useDateFilter의 calculateDateRange 함수에서 사용)
 * - label: 사용자에게 표시되는 텍스트
 * 
 * 배열 순서가 UI에서 버튼 표시 순서를 결정함
 */
export const PERIOD_BUTTONS = [
  { key: 'yesterday', label: '어제' },        // 어제 하루 (단일 날짜)
  { key: 'today', label: '오늘' },            // 오늘 하루 (실시간 현황)
  { key: '3days', label: '3일' },             // 최근 3일간 (단기 트렌드)
  { key: 'week', label: '일주일' },           // 최근 7일간 (주간 분석)
  { key: 'month', label: '한달' },            // 최근 30일간 (월간 분석)
  { key: 'firstHalf', label: '상반기' },      // 1월~6월 (반기 분석)
  { key: 'secondHalf', label: '하반기' },     // 7월~12월 (반기 분석)
  { key: 'thisYear', label: '올해' },         // 1월 1일~현재 (연간 누적)
  { key: 'lastYear', label: '작년' },         // 작년 전체 (연간 비교용)
  { key: 'custom', label: '사용자 정의' }     // 직접 날짜 입력 (특수 기간)
];

// ============================
// Chart.js 기본 설정
// ============================

/**
 * 막대 차트, 라인 차트용 기본 옵션 설정
 * TransactionTrendChart, MonthlyTrendChart 등에서 사용
 * 
 * 주요 특징:
 * - 반응형 차트로 컨테이너 크기에 맞춰 자동 조정
 * - Y축 0부터 시작하여 데이터 비교 용이
 * - 툴팁에서 금액은 천 단위 구분자, 건수는 '건' 단위 표시
 * - 그리드 라인으로 수치 읽기 편의성 향상
 */
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,              // 컨테이너 크기에 따라 차트 크기 자동 조정
  maintainAspectRatio: false,    // 고정 높이 설정 가능 (height: 300px 등)
  
  plugins: {
    // 범례 설정 (차트 상단의 라벨 표시 영역)
    legend: { 
      position: 'top',           // 차트 위쪽에 범례 배치
      display: true              // 범례 표시 (다중 데이터셋일 때 필요)
    },
    
    // 툴팁 설정 (마우스 호버 시 표시되는 정보창)
    tooltip: {
      enabled: true,             // 툴팁 활성화
      callbacks: {
        // 툴팁 라벨 포맷팅 함수
        label: function(context) {
          // 거래 건수는 '건' 단위로 표시
          if (context.dataset.label === '거래 건수') {
            return context.dataset.label + ': ' + context.parsed.y + '건';
          }
          // 금액은 천 단위 구분자와 '원' 단위로 표시
          return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + '원';
        }
      }
    }
  },
  
  // 축 설정
  scales: {
    // Y축 (세로축) - 수치 표시
    y: {
      beginAtZero: true,         // 0부터 시작하여 데이터 비교 용이
      ticks: {
        // Y축 눈금 라벨 포맷팅 (천 단위 구분자 추가)
        callback: function(value) {
          return value.toLocaleString();
        }
      },
      grid: {
        display: true,           // 가로 그리드 라인 표시
        color: 'rgba(0,0,0,0.1)' // 연한 회색으로 그리드 표시
      }
    },
    
    // X축 (가로축) - 시간/카테고리 표시
    x: {
      grid: {
        display: false           // 세로 그리드 라인 숨김 (깔끔한 표시)
      }
    }
  }
};

/**
 * 파이 차트, 도넛 차트용 전용 옵션 설정
 * CategoryStatsChart, PaymentMethodChart 등에서 사용
 * 
 * 주요 특징:
 * - 범례를 우측에 배치하여 원형 차트와 균형 잡힌 레이아웃
 * - 툴팁에서 금액과 퍼센티지를 함께 표시
 * - 비율 정보를 직관적으로 파악 가능
 */
export const PIE_CHART_OPTIONS = {
  responsive: true,              // 반응형 차트
  maintainAspectRatio: false,    // 고정 높이 설정 가능
  
  plugins: {
    // 범례 설정 (파이 차트는 우측 배치가 일반적)
    legend: { 
      position: 'right',         // 차트 오른쪽에 범례 배치
      display: true              // 각 조각별 색상과 라벨 표시
    },
    
    // 툴팁 설정
    tooltip: {
      enabled: true,
      callbacks: {
        // 파이 차트 전용 라벨 포맷팅 (금액 + 퍼센티지)
        label: function (context) {
          // 전체 합계 계산
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          // 현재 조각의 퍼센티지 계산 (소수점 1자리까지)
          const percentage = ((context.parsed * 100) / total).toFixed(1);
          // "카테고리명: 금액원 (퍼센티지%)" 형식으로 표시
          return context.label + ': ' + context.parsed.toLocaleString() + '원 (' + percentage + '%)';
        }
      }
    }
  }
};

// ============================
// 색상 시스템
// ============================

/**
 * 메인 색상 팔레트
 * 다양한 차트 요소에서 사용되는 18가지 구분 가능한 색상 배열
 * 
 * 색상 선택 기준:
 * - 시각적 구분성: 인접한 색상간 충분한 대비
 * - 접근성: 색맹 사용자도 구분 가능한 색상 조합
 * - 미적 조화: 함께 사용했을 때 조화로운 색상 팔레트
 * - 의미 전달: 직관적으로 의미를 전달할 수 있는 색상 (빨강=주의, 초록=좋음)
 */
export const COLOR_PALETTE = [
  '#FF6B6B',  // 산호색 - 주의/중요 데이터
  '#4ECDC4',  // 청록색 - 안정/신뢰 데이터  
  '#45B7D1',  // 하늘색 - 정보/중립 데이터
  '#96CEB4',  // 민트색 - 성장/긍정 데이터
  '#FFEAA7',  // 노란색 - 강조/특별 데이터
  '#DDA0DD',  // 자주색 - 프리미엄/고급 데이터
  '#98FB98',  // 연두색 - 자연/친환경 데이터
  '#F0E68C',  // 카키색 - 중성/보조 데이터
  '#FFB6C1',  // 분홍색 - 부드러움/서비스 데이터
  '#87CEEB',  // 하늘색 - 시원함/여름 데이터
  '#D2691E',  // 주황색 - 활동/에너지 데이터
  '#FF69B4',  // 핫핑크 - 트렌드/젊음 데이터
  '#20B2AA',  // 라이트시그린 - 바다/시원함 데이터
  '#9370DB',  // 보라색 - 신비/창의 데이터
  '#32CD32',  // 라임그린 - 자연/건강 데이터
  '#FF1493',  // 딥핑크 - 열정/사랑 데이터
  '#00CED1',  // 다크터콰이즈 - 깊이/전문 데이터
  '#FF6347'   // 토마토색 - 따뜻함/친근 데이터
];

/**
 * 결제 방법별 전용 색상 매핑
 * PaymentMethodChart에서 일관된 색상 표시를 위한 고정 매핑
 * 
 * 색상 선택 이유:
 * - 카드결제: 빨간색 (신용카드의 전형적인 색상)
 * - 현금결제: 청록색 (안정감, 전통적 결제 수단)
 * - 계좌이체: 파란색 (은행, 신뢰성의 상징색)
 * - 모바일결제: 초록색 (혁신, 디지털의 상징색)  
 * - 상품권: 노란색 (선물, 특별함의 상징색)
 */
export const PAYMENT_METHOD_COLORS = {
  '카드결제': '#FF6B6B',      // 빨간색 - 신용카드 이미지
  '현금결제': '#4ECDC4',      // 청록색 - 안정성과 전통
  '계좌이체': '#45B7D1',      // 파란색 - 은행과 신뢰
  '모바일결제': '#96CEB4',    // 초록색 - 혁신과 편의
  '상품권': '#FFEAA7'         // 노란색 - 선물과 특별함
};

/**
 * 결제 상태별 전용 색상 매핑
 * StatusStatsChart에서 결제 처리 상태를 직관적으로 구분
 * 
 * 색상 의미:
 * - COMPLETED: 초록색 (성공, 완료의 범용적 의미)
 * - CANCELLED: 빨간색 (취소, 오류의 범용적 의미)  
 * - PARTIAL_CANCELLED: 주황색 (주의, 부분적 문제)
 * - DELETED: 회색 (비활성, 삭제 상태)
 */
export const STATUS_COLORS = {
  'COMPLETED': '#10B981',         // 에메랄드 그린 - 성공/완료
  'CANCELLED': '#EF4444',         // 빨간색 - 취소/실패
  'PARTIAL_CANCELLED': '#F59E0B', // 앰버 - 부분 취소/주의
  'DELETED': '#6B7280'            // 회색 - 삭제/비활성
};

/**
 * 결제 상태 코드를 사용자 친화적 한국어로 변환하는 매핑
 * 시스템 내부 코드를 일반 사용자가 이해하기 쉬운 용어로 변환
 * 
 * 변환 예시:
 * 'COMPLETED' → '완료' (직관적 이해)
 * 'PARTIAL_CANCELLED' → '부분취소' (정확한 상태 설명)
 */
export const STATUS_DISPLAY_NAMES = {
  'COMPLETED': '완료',           // 결제 성공적 완료
  'CANCELLED': '전체취소',       // 전액 취소 상태
  'PARTIAL_CANCELLED': '부분취소', // 일부만 취소된 상태
  'DELETED': '삭제'              // 데이터 삭제 상태 (관리자 작업)
};

// ============================
// 유틸리티 함수들
// ============================

/**
 * 랜덤 색상 반환 함수
 * 동적으로 생성되는 차트 요소에 무작위 색상을 할당할 때 사용
 * 
 * 사용 사례:
 * - 카테고리 수가 가변적일 때
 * - 새로운 데이터 항목이 추가될 때
 * - 임시 데이터나 테스트 데이터 표시 시
 * 
 * @returns {string} COLOR_PALETTE에서 무작위로 선택된 HEX 색상 코드
 */
export const getRandomColor = () => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

/**
 * 결제 방법에 따른 색상 반환 함수
 * 결제 방법명을 받아서 해당하는 고정 색상을 반환
 * 
 * @param {string} method - 결제 방법명 ('카드결제', '현금결제' 등)
 * @returns {string} 해당 결제 방법의 HEX 색상 코드 (매핑 없으면 기본 회색)
 * 
 * 사용 예시:
 * getPaymentMethodColor('카드결제') → '#FF6B6B'
 * getPaymentMethodColor('알려지지않은방법') → '#6B7280'
 */
export const getPaymentMethodColor = (method) => {
  return PAYMENT_METHOD_COLORS[method] || '#6B7280';  // 기본값: 중간 회색
};

/**
 * 월 번호에 따른 색상 반환 함수
 * 월별 차트에서 각 월을 구분하기 위한 색상 할당
 * 
 * @param {number} month - 월 번호 (1-12)
 * @returns {string} 해당 월의 HEX 색상 코드
 * 
 * 로직:
 * - 월 번호를 0-based 인덱스로 변환 (month - 1)
 * - COLOR_PALETTE 길이로 나머지 연산하여 순환 할당
 * - 1월=첫번째색, 2월=두번째색, ..., 13월=첫번째색(순환)
 * 
 * 사용 예시:
 * getMonthColor(1) → '#FF6B6B' (1월)
 * getMonthColor(12) → COLOR_PALETTE[11] (12월)
 */
export const getMonthColor = (month) => {
  return COLOR_PALETTE[(month - 1) % COLOR_PALETTE.length];
};

/**
 * 결제 상태에 따른 색상 반환 함수
 * 결제 상태 코드를 받아서 해당하는 상태별 색상을 반환
 * 
 * @param {string} status - 결제 상태 코드 ('COMPLETED', 'CANCELLED' 등)
 * @returns {string} 해당 상태의 HEX 색상 코드 (매핑 없으면 기본 회색)
 * 
 * 사용 예시:
 * getStatusColor('COMPLETED') → '#10B981' (초록색)
 * getStatusColor('UNKNOWN_STATUS') → '#6B7280' (기본 회색)
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#6B7280';  // 기본값: 중간 회색
};

/**
 * 결제 상태 코드를 한국어 표시명으로 변환하는 함수
 * 시스템 코드를 사용자가 이해할 수 있는 한국어로 변환
 * 
 * @param {string} status - 결제 상태 코드 ('COMPLETED', 'CANCELLED' 등)
 * @returns {string} 한국어 상태 표시명 (매핑 없으면 원본 코드 그대로)
 * 
 * 사용 예시:
 * getStatusDisplayName('COMPLETED') → '완료'
 * getStatusDisplayName('UNKNOWN_STATUS') → 'UNKNOWN_STATUS'
 */
export const getStatusDisplayName = (status) => {
  return STATUS_DISPLAY_NAMES[status] || status;  // 기본값: 원본 상태 코드
};