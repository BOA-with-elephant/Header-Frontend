import { useState, useEffect, useCallback } from 'react';
import {
  filterSalesByPeriod,
  processTransactionData,
  filterMonthlyData
} from '@/utils/sales/dataProcessing';
import {
  getRandomColor,
  getPaymentMethodColor,
  getMonthColor,
  getStatusColor,
  getStatusDisplayName
} from '@/constants/sales/chartConfig';

const SHOP_CODE = 1;
const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}`;

export const useChartData = (allSalesData) => {
  const [monthlyTrend, setMonthlyTrend] = useState({
    loading: false,
    data: [],
    period: 'thisYear'
  });

  const [categoryStats, setCategoryStats] = useState({
    loading: false,
    data: [],
    period: 'month'
  });

  const [transactionTrend, setTransactionTrend] = useState({
    loading: false,
    data: [],
    unit: 'daily',
    period: 'month'
  });

  const [paymentMethodStats, setPaymentMethodStats] = useState({
    loading: false,
    data: [],
    period: 'month'
  });

  const [statusStats, setStatusStats] = useState({
    loading: false,
    data: [],
    period: 'month'
  });

  // === 초기 로딩 ===
  useEffect(() => {
    if (Array.isArray(allSalesData) && allSalesData.length > 0) {
      loadMonthlyTrend('thisYear');
    }
  }, [allSalesData]);

  const loadMonthlyTrend = useCallback(async (periodToLoad = monthlyTrend.period) => {
    setMonthlyTrend(prev => ({ ...prev, loading: true, period: periodToLoad }));

    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setMonthlyTrend(prev => ({ ...prev, data: [], loading: false }));
      return;
    }

    try {
      const filteredSales = filterSalesByPeriod(allSalesData, periodToLoad);
      const monthlyMap = new Map();

      filteredSales.forEach((sale) => {
        const dateFields = ['createdDate', 'payDatetime', 'orderDate', 'saleDate'];
        let dateValue = null;
        for (const field of dateFields) {
          if (sale[field]) {
            dateValue = sale[field];
            break;
          }
        }

        if (!dateValue) return;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return;

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month.toString().padStart(2, '0')}`;

        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            year,
            month,
            totalAmount: 0,
            cancelAmount: 0,
            count: 0,
            label: `${year}년 ${month}월`
          });
        }

        const stats = monthlyMap.get(key);
        const payAmount = parseFloat(sale.payAmount || sale.amount || sale.finalAmount || 0);
        const finalAmount = parseFloat(sale.finalAmount || sale.amount || payAmount || 0);

        stats.totalAmount += payAmount;
        stats.cancelAmount += Math.max(0, payAmount - finalAmount);
        stats.count += 1;
      });

      const finalData = Array.from(monthlyMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      setMonthlyTrend(prev => ({
        ...prev,
        data: finalData.map(item => ({
          ...item,
          netSalesAmount: item.totalAmount - item.cancelAmount
        })),
        loading: false
      }));
    } catch (error) {
      console.error('월별 추이 처리 오류:', error);
      setMonthlyTrend(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [allSalesData]);

  /**
   * 카테고리별 매출 통계 로딩
   * 클라이언트 사이드에서 allSalesData를 기반으로 카테고리별 집계
   * 
   * @param {string} periodToLoad - 필터링할 기간
   */
  const loadCategoryStats = useCallback((periodToLoad = categoryStats.period) => {
    setCategoryStats(prev => ({ ...prev, loading: true, period: periodToLoad }));

    // 기본 데이터 검증
    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setCategoryStats(prev => ({ ...prev, data: [], loading: false }));
      return;
    }

    try {
      // 지정된 기간으로 매출 데이터 필터링
      const filteredData = filterSalesByPeriod(allSalesData, periodToLoad);

      // 카테고리별로 매출 집계
      const categoryMap = new Map();
      filteredData.forEach(item => {
        // 카테고리명 추출 (여러 필드명 지원)
        const category = item.categoryName || item.category || item.menuCategory || '기타';
        // 금액 추출 (여러 필드명 지원)
        const amount = parseFloat(item.finalAmount || item.amount || item.totalAmount || 0);
        // 색상 추출 또는 랜덤 색상 생성
        const color = item.menuColor || item.categoryColor || getRandomColor();

        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            amount: 0,
            count: 0,
            color: color
          });
        }

        const categoryData = categoryMap.get(category);
        categoryData.amount += amount;
        categoryData.count += 1;
      });

      // Map을 배열로 변환
      const categoryArray = Array.from(categoryMap.values());
      setCategoryStats(prev => ({
        ...prev,
        data: categoryArray,
        loading: false
      }));
    } catch (error) {
      console.error('카테고리 통계 처리 실패:', error);
      setCategoryStats(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [allSalesData, categoryStats.period]);

  /**
   * 거래 건수 추이 데이터 로딩
   * 클라이언트 사이드에서 allSalesData를 기반으로 시간별 거래 건수 집계
   * 
   * @param {string} unitToLoad - 집계 단위 ('daily', 'weekly', 'monthly')
   * @param {string} periodToLoad - 조회 기간
   */
  const loadTransactionTrend = useCallback((unitToLoad = transactionTrend.unit, periodToLoad = transactionTrend.period) => {
    setTransactionTrend(prev => ({ ...prev, loading: true, unit: unitToLoad, period: periodToLoad }));

    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setTransactionTrend(prev => ({ ...prev, data: [], loading: false }));
      return;
    }

    try {
      // 유틸리티 함수를 사용하여 거래 추이 데이터 처리
      const processedData = processTransactionData(allSalesData, unitToLoad, periodToLoad);

      setTransactionTrend(prev => ({
        ...prev,
        data: processedData,
        loading: false
      }));
    } catch (error) {
      console.error('거래 추이 처리 실패:', error);
      setTransactionTrend(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [allSalesData, transactionTrend.unit, transactionTrend.period]);

  /**
   * 결제 방법별 통계 로딩
   * 우선 API에서 데이터를 가져오고, 실패 시 클라이언트 사이드 처리로 fallback
   * 
   * @param {string} periodToLoad - 필터링할 기간
   */
  const loadPaymentMethodStats = useCallback(async (periodToLoad = paymentMethodStats.period) => {
  console.log('🔍 결제방법 통계 디버깅');
  setPaymentMethodStats(prev => ({ ...prev, loading: true, period: periodToLoad }));
  
  // API 호출을 건너뛰고 바로 캐시 데이터 사용
  console.log('캐시 데이터로 처리 시작');
  loadPaymentMethodStatsFromCache(periodToLoad);
}, [allSalesData]);

  /**
   * 캐시된 데이터로 결제 방법별 통계 처리
   * API 호출 실패 시 클라이언트 사이드에서 allSalesData를 기반으로 집계
   * 
   * @param {string} periodToLoad - 필터링할 기간
   */
  const loadPaymentMethodStatsFromCache = useCallback((periodToLoad = paymentMethodStats.period) => {
    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setPaymentMethodStats(prev => ({ ...prev, data: [], loading: false }));
      return;
    }

    // 지정된 기간으로 데이터 필터링
    const filteredData = filterSalesByPeriod(allSalesData, periodToLoad);

    // 결제 방법별로 집계
    const methodMap = new Map();
    filteredData.forEach(item => {
      const method = item.payMethod || item.paymentMethod || '기타';
      const amount = parseFloat(item.finalAmount || item.amount || 0);

      if (!methodMap.has(method)) {
        methodMap.set(method, {
          method,
          amount: 0,
          count: 0,
          color: getPaymentMethodColor(method)
        });
      }

      const methodData = methodMap.get(method);
      methodData.amount += amount;
      methodData.count += 1;
    });

    const methodArray = Array.from(methodMap.values());
    setPaymentMethodStats(prev => ({
      ...prev,
      data: methodArray,
      loading: false
    }));
  }, [allSalesData, paymentMethodStats.period]);

  /**
   * 결제 상태별 통계 로딩
   * 클라이언트 사이드에서 allSalesData를 기반으로 결제 상태별 집계
   * 
   * @param {string} periodToLoad - 필터링할 기간
   */
  const loadStatusStats = useCallback((periodToLoad = statusStats.period) => {
    setStatusStats(prev => ({ ...prev, loading: true, period: periodToLoad }));

    if (!Array.isArray(allSalesData) || allSalesData.length === 0) {
      setStatusStats(prev => ({ ...prev, data: [], loading: false }));
      return;
    }

    try {
      // 지정된 기간으로 데이터 필터링
      const filteredData = filterSalesByPeriod(allSalesData, periodToLoad);

      // 결제 상태별로 집계
      const statusMap = new Map();
      filteredData.forEach(item => {
        const status = getStatusDisplayName(item.payStatus); // 상태 표시명 변환
        if (!statusMap.has(status)) {
          statusMap.set(status, {
            status,
            count: 0,
            color: getStatusColor(item.payStatus) // 상태별 색상 지정
          });
        }
        statusMap.get(status).count += 1;
      });

      // 퍼센티지 계산 추가
      const statusArray = Array.from(statusMap.values());
      const totalCount = statusArray.reduce((sum, item) => sum + item.count, 0);
      const processedData = statusArray.map(item => ({
        ...item,
        percentage: totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0
      }));

      setStatusStats(prev => ({
        ...prev,
        data: processedData,
        loading: false
      }));
    } catch (error) {
      console.error('상태 통계 처리 실패:', error);
      setStatusStats(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [allSalesData, statusStats.period]);

  /**
   * 모든 차트 데이터 업데이트
   * 각 차트의 현재 설정된 기간/단위를 기반으로 모든 차트를 다시 로드
   * 주로 전체 데이터가 변경되었을 때 사용
   */
  const updateAllCharts = useCallback(() => {
    loadCategoryStats(categoryStats.period);
    loadTransactionTrend(transactionTrend.unit, transactionTrend.period);
    loadPaymentMethodStats(paymentMethodStats.period);
    loadStatusStats(statusStats.period);
    // loadMonthlyTrend는 useSalesData의 useEffect에서 별도로 처리되므로 여기서는 제외
  }, [loadCategoryStats, loadTransactionTrend, loadPaymentMethodStats, loadStatusStats,
    categoryStats.period, transactionTrend.unit, transactionTrend.period, paymentMethodStats.period, statusStats.period]);

  // === 필터 변경 핸들러들 ===
  // 각 핸들러는 상태 업데이트와 함께 즉시 데이터를 다시 로드

  /**
   * 월별 추이 차트 필터 변경
   * @param {string} period - 새로운 기간 설정
   */
  const handleMonthlyTrendFilter = useCallback((period) => {
    setMonthlyTrend(prev => ({ ...prev, period }));
    loadMonthlyTrend(period);
  }, [loadMonthlyTrend]);

  /**
   * 카테고리별 통계 필터 변경
   * @param {string} period - 새로운 기간 설정
   */
  const handleCategoryStatsFilter = useCallback((period) => {
    setCategoryStats(prev => ({ ...prev, period }));
    loadCategoryStats(period);
  }, [loadCategoryStats]);

  /**
   * 거래 추이 차트 필터 변경
   * @param {string} unit - 새로운 집계 단위
   * @param {string} period - 새로운 조회 기간
   */
  const handleTransactionTrendFilter = useCallback((unit, period) => {
    setTransactionTrend(prev => ({ ...prev, unit, period }));
    loadTransactionTrend(unit, period);
  }, [loadTransactionTrend]);

  /**
   * 결제 방법별 통계 필터 변경
   * @param {string} period - 새로운 기간 설정
   */
  const handlePaymentMethodFilter = useCallback((period) => {
    setPaymentMethodStats(prev => ({ ...prev, period }));
    loadPaymentMethodStats(period);
  }, [loadPaymentMethodStats]);

  /**
   * 결제 상태별 통계 필터 변경
   * @param {string} period - 새로운 기간 설정
   */
  const handleStatusStatsFilter = useCallback((period) => {
    setStatusStats(prev => ({ ...prev, period }));
    loadStatusStats(period);
  }, [loadStatusStats]);

  // 훅에서 반환하는 값들
  return {
    // 차트 데이터 상태
    monthlyTrend,           // 월별 매출 추이 데이터
    categoryStats,          // 카테고리별 매출 통계
    transactionTrend,       // 거래 건수 추이 데이터
    paymentMethodStats,     // 결제 방법별 통계
    statusStats,           // 결제 상태별 통계

    // 필터 변경 핸들러들
    handleMonthlyTrendFilter,      // 월별 추이 필터 변경
    handleCategoryStatsFilter,     // 카테고리 필터 변경
    handleTransactionTrendFilter,  // 거래 추이 필터 변경
    handlePaymentMethodFilter,     // 결제 방법 필터 변경
    handleStatusStatsFilter,       // 상태 필터 변경

    // 유틸리티 함수들
    updateAllCharts,      // 모든 차트 업데이트
    loadMonthlyTrend     // 월별 추이 로딩 (useSalesData에서 사용)
  };
};