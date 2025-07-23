import React from 'react';
import StatsCard from './common/StatsCard';
import { DollarSign, TrendingDown, TrendingUp, Clock } from './common/Icons';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

const SummaryStatsCards = ({ summaryStats, dateRange }) => {
  return (
    <div className={styles.statsGrid}>
      <StatsCard
        title="총 매출액"
        value={`${summaryStats.totalSales.toLocaleString()}원`}
        icon={DollarSign}
        trend="up"
        trendValue={`${dateRange.startDate} ~ ${dateRange.endDate}`}
        variant="blue"
      />
      <StatsCard
        title="취소 금액"
        value={`${summaryStats.totalCancel.toLocaleString()}원`}
        icon={TrendingDown}
        trend="down"
        trendValue={`${dateRange.startDate} ~ ${dateRange.endDate}`}
        variant="red"
      />
      <StatsCard
        title="순 매출액"
        value={`${(summaryStats.totalSales - summaryStats.totalCancel).toLocaleString()}원`}
        icon={TrendingUp}
        trend="up"
        trendValue="총매출 - 취소금액"
        variant="green"
      />
      <StatsCard
        title="평균 거래액"
        value={`${summaryStats.avgTransaction.toLocaleString()}원`}
        icon={Clock}
        trend="up"
        trendValue={`총 ${summaryStats.totalTransactions}건`}
        variant="purple"
      />
    </div>
  );
};

export default SummaryStatsCards;