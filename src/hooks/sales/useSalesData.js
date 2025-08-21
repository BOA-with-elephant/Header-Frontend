import { useState, useEffect } from 'react';
import { useDateFilter } from './useDateFilter';
import { useChartData } from './useChartData';
import { filterSalesByDateRange } from '@/utils/sales/dataProcessing';
import { exportCSV } from '@/utils/sales/exportUtils';

const SHOP_CODE = 1;
// const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}`;
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}`;

/**
 * 매출 데이터 통합 관리를 위한 메인 커스텀 훅
 */
export const useSalesData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSalesData, setAllSalesData] = useState([]);

  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalCancel: 0,
    totalTransactions: 0,
    avgTransaction: 0,
  });

  const {
    selectedPeriod,
    dateRange,
    handlePeriodChange,
    handleDateRangeChange,
    handleCustomSearch,
  } = useDateFilter();

  const {
    monthlyTrend,
    categoryStats,
    transactionTrend,
    paymentMethodStats,
    statusStats,
    handleMonthlyTrendFilter,
    handleCategoryStatsFilter,
    handleTransactionTrendFilter,
    handlePaymentMethodFilter,
    handleStatusStatsFilter,
    updateAllCharts,
    loadMonthlyTrend,
  } = useChartData(allSalesData);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading && allSalesData.length > 0) {
      updateSummaryStats();
      updateAllCharts();
    }
  }, [dateRange, allSalesData, loading]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const salesResult = await fetch(`${API_BASE_URL}/sales/active`);
      if (!salesResult.ok) {
        throw new Error(`서버 응답 오류: ${salesResult.status}`);
      }

      const salesData = await salesResult.json();

      console.log('=== API 응답 디버깅 ===');
      console.log('전체 매출 데이터 로딩 완료:', salesData.length, '개');
      console.log('salesData는 배열인가?:', Array.isArray(salesData));
      console.log('첫 3개 데이터 샘플:', salesData.slice(0, 3));
      console.log('===================');

      setAllSalesData(salesData);

      await loadMonthlyTrend();    // ✅ 월별 추이 차트 먼저 로딩
      updateAllCharts();           // ✅ 모든 차트 데이터 즉시 업데이트

    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (error.message.includes('서버 응답 오류')) {
        setError('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSummaryStats = () => {
    console.log('✅ 선택된 날짜 범위:', dateRange);
    console.log('✅ 원본 데이터 수:', allSalesData.length);
    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setSummaryStats({
        totalSales: 0,
        totalCancel: 0,
        totalTransactions: 0,
        avgTransaction: 0,
      });
      return;
    }

    const filteredData = filterSalesByDateRange(
      allSalesData,
      dateRange.startDate,
      dateRange.endDate
    );
    const validItems = filteredData.filter(
      (item) => item && typeof item === 'object'
    );

    const totalSales = validItems.reduce((sum, item) => {
      const amount = parseFloat(item.payAmount || item.amount || item.totalAmount || 0);
      return sum + amount;
    }, 0);

    const totalCancel = validItems.reduce((sum, item) => {
      const originalAmount = parseFloat(item.payAmount || item.amount || item.totalAmount || 0);
      const finalAmount = parseFloat(item.finalAmount || item.amount || item.totalAmount || 0);
      const cancelAmount = originalAmount - finalAmount;
      return sum + (cancelAmount > 0 ? cancelAmount : 0);
    }, 0);

    const totalTransactions = validItems.length;
    const netSales = totalSales - totalCancel;
    const avgTransaction = totalTransactions > 0 ? Math.round(netSales / totalTransactions) : 0;

    setSummaryStats({
      totalSales,
      totalCancel,
      totalTransactions,
      avgTransaction,
    });
  };

  const handleReportDownload = () => {
    const reportData = [
      ['구분', '값'],
      ['조회 기간', `${dateRange.startDate} ~ ${dateRange.endDate}`],
      ['총 매출액', `${summaryStats.totalSales.toLocaleString()}원`],
      ['총 취소금액', `${summaryStats.totalCancel.toLocaleString()}원`],
      ['순 매출액', `${(summaryStats.totalSales - summaryStats.totalCancel).toLocaleString()}원`],
      ['총 거래건수', `${summaryStats.totalTransactions}건`],
      ['평균 거래액', `${summaryStats.avgTransaction.toLocaleString()}원`],
      [''],
      ['카테고리별 상세'],
      ['카테고리', '매출액', '거래건수'],
      ...categoryStats.data.map((stat) => [
        stat.category,
        `${stat.amount.toLocaleString()}원`,
        `${stat.count}건`,
      ]),
    ];

    const fileName = `매출통계_${dateRange.startDate}_${dateRange.endDate}.csv`;
    exportCSV(reportData, fileName);
  };

  return {
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
    loadInitialData,
  };
};
