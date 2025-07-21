import React from 'react';
import { TrendingUp, TrendingDown } from './Icons';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

/**
 * 통계 카드 컴포넌트
 */
const StatsCard = ({ title, value, icon: Icon, trend, trendValue, variant = "blue" }) => {
  // trendValue 줄바꿈 포맷터
  const formatTrendValue = (value) => {
    if (!value) return null;

    // 날짜 형식인지 확인 (YYYY-MM-DD)
    const isDate = /^\d{4}-\d{2}-\d{2}/.test(value);

    let breakIndex = -1;

    if (isDate && value.includes('~')) {
      breakIndex = value.indexOf('~');
    } else if (!isDate && value.includes('-')) {
      breakIndex = value.indexOf('-');
    }

    if (breakIndex === -1) return value;

    const before = value.slice(0, breakIndex + 1).trim(); // 구분자 포함
    const after = value.slice(breakIndex + 1).trim();

    return (
      <>
        <span>{before}</span>
        <br />
        <span>{after}</span>
      </>
    );
  };

  return (
    <div className={`${styles.statsCard} ${styles[variant]}`}>
      <div className={styles.statsCardContent}>
        {/* 좌측 정보 */}
        <div className={styles.statsCardInfo}>
          <p className={styles.statsCardTitle}>{title}</p>
          <p className={styles.statsCardValue}>{value}</p>

          {trend && (
            <p className={`${styles.statsCardTrend} ${styles[trend]}`}>
              {trend === 'up' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              <span className={styles.trendValue}>
                {formatTrendValue(trendValue)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
