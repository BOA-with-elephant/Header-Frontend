import React from 'react';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

/**
 * 주요 인사이트 섹션 컴포넌트
 * 
 * 주요 기능:
 * - 차트 데이터를 분석하여 핵심 비즈니스 인사이트 자동 생성
 * - 복잡한 데이터를 이해하기 쉬운 문장으로 요약 제시
 * - 4개 핵심 영역의 주요 패턴과 특징 하이라이트
 * - 데이터 부족 상황에 대한 적절한 안내 메시지 제공
 * 
 * 분석 영역:
 * 1. 매출 트렌드: 기간별 최고/최저 매출, 성장률 등
 * 2. 인기 카테고리: 매출 기준 상위 카테고리 식별
 * 3. 결제 선호도: 가장 많이 사용되는 결제 방법 파악
 * 4. 거래 패턴: 시간대별 평균 거래량 분석
 * 
 * 비즈니스 가치:
 * - 데이터 해석 부담 감소: 복잡한 차트를 한눈에 이해할 수 있는 요약 제공
 * - 액션 아이템 도출: 구체적인 개선점이나 강점 식별 지원
 * - 의사결정 지원: 데이터 기반의 전략 수립을 위한 핵심 정보 제공
 * - 보고서 작성: 경영진 보고용 요약 정보 자동 생성
 * 
 * @param {Object} props - 컴포넌트 props (모든 차트 데이터)
 * @param {Object} props.monthlyTrend - 월별 매출 추이 데이터
 * @param {Array} props.monthlyTrend.data - 월별 데이터 배열 (amount, period 포함)
 * @param {Object} props.categoryStats - 카테고리별 통계 데이터  
 * @param {Array} props.categoryStats.data - 카테고리 데이터 배열 (category, amount 포함)
 * @param {Object} props.paymentMethodStats - 결제 방법별 통계 데이터
 * @param {Array} props.paymentMethodStats.data - 결제 방법 데이터 배열 (method, amount 포함)
 * @param {Object} props.transactionTrend - 거래 건수 추이 데이터
 * @param {Array} props.transactionTrend.data - 거래 추이 데이터 배열 (count, period 포함)
 * @param {string} props.transactionTrend.unit - 집계 단위 ('daily', 'weekly', 'monthly')
 */
const InsightsSection = ({ monthlyTrend, categoryStats, paymentMethodStats, transactionTrend }) => {
  return (
    <div className={styles.insightsSection}>
      {/* 섹션 제목 */}
      <h3 className={styles.sectionTitle}>주요 인사이트</h3>

      {/* 인사이트 카드 그리드 - 4개 핵심 분석 영역 */}
      <div className={styles.insightsGrid}>

        {/* 1. 매출 트렌드 분석 카드 */}
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>매출 트렌드</h4>
          <p className={styles.insightText}>
            {monthlyTrend.data.length > 1 ? (
              `최근 ${monthlyTrend.data.length}개월 중 최고 매출: ${Math.max(
                ...monthlyTrend.data.map(d => {
                  const num = Number(d.amount);
                  return !isNaN(num) ? num : 0;
                })
              ).toLocaleString()}원`
            ) : (
              '충분한 데이터가 필요합니다.'
            )}
          </p>
          {/* 
              향후 확장 가능한 분석:
              - 전월 대비 성장률: ((이번달 - 지난달) / 지난달) * 100
              - 최고/최저 매출 월 비교
              - 매출 변동성(표준편차) 계산
              - 계절성 패턴 분석
            */}
        </div>


        {/* 2. 인기 카테고리 분석 카드 */}
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>인기 카테고리</h4>
          <p className={styles.insightText}>
            {categoryStats.data.length > 0 ? (
              // 매출액 기준 정렬하여 1위 카테고리 식별
              `가장 많이 팔린 카테고리: ${categoryStats.data
                .sort((a, b) => b.amount - a.amount)  // 내림차순 정렬
              [0]?.category || '없음'               // 첫 번째 항목의 카테고리명
              }`
            ) : (
              // 데이터 없음 안내
              '카테고리 데이터가 없습니다.'
            )}
          </p>
          {/* 
            향후 확장 가능한 분석:
            - 상위 3개 카테고리와 비중
            - 카테고리별 성장률 비교
            - 신규 vs 기존 카테고리 성과
            - 카테고리 다양성 지수
          */}
        </div>

        {/* 3. 결제 선호도 분석 카드 */}
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>결제 선호도</h4>
          <p className={styles.insightText}>
            {paymentMethodStats.data.length > 0 ? (
              // 결제 금액 기준 정렬하여 주요 결제 방법 식별
              `주요 결제 방법: ${paymentMethodStats.data
                .sort((a, b) => b.amount - a.amount)  // 금액 기준 내림차순
              [0]?.method || '없음'                 // 가장 많이 사용된 결제 방법
              }`
            ) : (
              // 데이터 없음 안내
              '결제 방법 데이터가 없습니다.'
            )}
          </p>
          {/* 
            향후 확장 가능한 분석:
            - 현금 vs 카드 비율
            - 모바일 결제 증가 추세
            - 결제 방법별 평균 거래액
            - 시간대별 결제 방법 선호도
          */}
        </div>

        {/* 4. 거래 패턴 분석 카드 */}
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>거래 패턴</h4>
          <p className={styles.insightText}>
            {transactionTrend.data.length > 0 ? (
              // 집계 단위별 평균 거래량 계산 및 표시
              `${
              // 집계 단위를 한국어로 변환
              transactionTrend.unit === 'daily' ? '일' :
                transactionTrend.unit === 'weekly' ? '주' : '월'
              }별 평균 거래: ${
              // 전체 거래 건수의 평균 계산
              Math.round(
                transactionTrend.data.reduce((sum, d) => sum + d.count, 0) /
                transactionTrend.data.length
              )
              }건`
            ) : (
              // 데이터 없음 안내
              '거래 데이터가 없습니다.'
            )}
          </p>
          {/* 
            향후 확장 가능한 분석:
            - 피크 시간대 식별 (일별 분석 시)
            - 요일별 거래 패턴 (주별 분석 시)
            - 거래량 변동성 분석
            - 특이 패턴 감지 (급증/급감 구간)
            - 고객 방문 주기 분석
          */}
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;