import React from 'react';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

const SalesStatisticsHeader = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>매출 통계</h1>
      <p className={styles.subtitle}>차트별 맞춤 기간 설정으로 정확한 분석을 확인하세요</p>
    </div>
  );
};

export default SalesStatisticsHeader;