"use client";
import React from 'react';
import {
  SalesStatisticsHeader,
  PeriodFilter,
  SummaryStatsCards,
  MonthlyTrendChart,
  CategoryStatsChart,
  TransactionTrendChart,
  PaymentMethodChart,
  StatusStatsChart,
  InsightsSection,
  DetailedAnalysisTable
} from '@/components/sales/statistics';
import { useSalesData } from '@/hooks/sales/useSalesData';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

const SalesStatistics = () => {
  const {
    loading,
    error,
    allSalesData,
    summaryStats,
    monthlyTrend,
    categoryStats,
    transactionTrend,
    paymentMethodStats,
    statusStats,
    selectedPeriod,
    dateRange,
    handlePeriodChange,
    handleDateRangeChange,
    handleCustomSearch,
    handleMonthlyTrendFilter,
    handleCategoryStatsFilter,
    handleTransactionTrendFilter,
    handlePaymentMethodFilter,
    handleStatusStatsFilter,
    handleReportDownload,
    loadInitialData
  } = useSalesData();

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <SalesStatisticsHeader />
        <div style={{ color: 'var(--color-error)', textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button
            onClick={loadInitialData}
            className={styles.searchButton}
            style={{ marginTop: '1rem' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <SalesStatisticsHeader />

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={handleDateRangeChange}
        onCustomSearch={handleCustomSearch}
        onReportDownload={handleReportDownload}
      />

      <SummaryStatsCards
        summaryStats={summaryStats}
        dateRange={dateRange}
      />

      <div className={styles.chartsGrid}>
        <MonthlyTrendChart
          data={monthlyTrend}
          onFilterChange={handleMonthlyTrendFilter}
        />

        <CategoryStatsChart
          data={categoryStats}
          onFilterChange={handleCategoryStatsFilter}
        />

        <TransactionTrendChart
          data={transactionTrend}
          onFilterChange={handleTransactionTrendFilter}
        />

        <PaymentMethodChart
          data={paymentMethodStats}
          onFilterChange={handlePaymentMethodFilter}
        />
      </div>

        <StatusStatsChart
          data={statusStats}
          onFilterChange={handleStatusStatsFilter}
        />

      <InsightsSection
        monthlyTrend={monthlyTrend}
        categoryStats={categoryStats}
        paymentMethodStats={paymentMethodStats}
        transactionTrend={transactionTrend}
      />

      {monthlyTrend.data.length > 0 && (
        <DetailedAnalysisTable
          data={monthlyTrend}
          title="금년 월별 매출 분석"
        />
      )}
    </div>
  );
};

export default SalesStatistics;