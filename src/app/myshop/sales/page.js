"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/admin/sales/SalesManagement.module.css";
import Pagination from "@/components/ui/AdvancedPagination"; // Pagination 컴포넌트 import
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function SalesManagement() {
  // 상수 정의
  const SHOP_CODE = 1; // TODO: 실제 샵 코드에 따라 동적으로 변경하기
  const API_BASE_URL = `http://localhost:8080/api/v1/myshop/${SHOP_CODE}`;

  // 현재 월의 시작일과 종료일을 계산하는 함수
  const getInitialDateFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const firstDay = `${year}-${month}-01`;
    const lastDay = today.toISOString().split('T')[0]; // 오늘 날짜
    return { startDate: firstDay, endDate: lastDay };
  };

  // 상태 변수 정의
  const [salesData, setSalesData] = useState([]); // 전체 매출 데이터 (필터링 전 원본)
  const [filteredData, setFilteredData] = useState([]); // 필터링된 매출 데이터
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [searchFilters, setSearchFilters] = useState(getInitialDateFilters()); // 초기 검색 필터를 현재 월로 설정
  const { showMessage, MessageModalComponent } = useMessageModal(); // 메시지 모달 훅 사용
  const { modal, closeModal, showError, showConfirm } = useMessageModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchSalesData(API_BASE_URL, setIsLoading, setSalesData, setFilteredData, getInitialDateFilters, setCurrentPage, showMessage) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sales/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const formattedData = data.map(item => ({
        id: item.salesCode,
        date: item.resvDate,
        time: item.resvTime,
        customerName: item.userName,
        customerPhone: item.userPhone,
        serviceName: item.menuName,
        servicePrice: item.menuPrice,
        discount: item.menuPrice - item.finalAmount,
        finalAmount: item.finalAmount,
        paymentMethod: item.payMethod,
        status: item.payStatus,
        memo: item.userComment,
        cancelAmount: item.cancelAmount
      }));

      setSalesData(formattedData);

      const initialFilters = getInitialDateFilters();
      const initiallyFiltered = formattedData.filter(item => {
        const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
          (!initialFilters.endDate || item.date <= initialFilters.endDate);
        return matchesDateRange;
      });
      setFilteredData(initiallyFiltered);
      setCurrentPage(1);

    } catch (error) {
      console.error("매출 데이터를 불러오는 중 오류 발생:", error);
      showMessage(MESSAGES.ERROR_FETCHING_SALES_DATA);
      setSalesData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSalesData(API_BASE_URL, setIsLoading, setSalesData, setFilteredData, getInitialDateFilters, setCurrentPage, showMessage);
  }, [API_BASE_URL, showMessage]);

  // 엑셀 다운로드 핸들러 - 필터링된 전체 데이터 사용
  const handleExcelDownload = () => {
    // filteredData는 현재 필터 조건에 맞는 모든 데이터 (페이징 무관)
    const excelData = filteredData.map(item => ({
      '시술일시': `${item.date} ${item.time}`,
      '고객명': item.customerName,
      '시술명': item.serviceName,
      '시술가격': item.servicePrice,
      '할인금액': item.discount,
      '최종금액': item.finalAmount,
      '결제방법': item.paymentMethod,
      '상태': item.status === 'COMPLETED' ? '완료' :
        item.status === 'CANCELLED' ? '취소' : '부분취소',
      '취소금액': item.cancelAmount || 0
    }));

    const csvContent = [
      Object.keys(excelData[0]).join(','),
      ...excelData.map(row => Object.values(row).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `매출내역_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 검색 필터 변경 시 상태 업데이트
  const handleFilterChange = (field, value) => {
    const newFilters = { ...searchFilters, [field]: value };
    setSearchFilters(newFilters);

    // 즉시 필터링 적용
    const filtered = salesData.filter(item => {
      const matchesDateRange = (!newFilters.startDate || item.date >= newFilters.startDate) &&
        (!newFilters.endDate || item.date <= newFilters.endDate);
      const matchesCustomer = !newFilters.customerName || item.customerName.toLowerCase().includes(newFilters.customerName.toLowerCase());
      const matchesService = !newFilters.serviceName || item.serviceName.toLowerCase().includes(newFilters.serviceName.toLowerCase());
      const matchesStatus = !newFilters.status || item.status === newFilters.status;
      return matchesDateRange && matchesCustomer && matchesService && matchesStatus;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // 검색 초기화 핸들러
  const handleReset = () => {
    // 모든 필터를 초기 상태로 설정
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = today.toISOString().split('T')[0];

    const initialFilters = {
      startDate: firstDay,
      endDate: lastDay,
      customerName: '',
      serviceName: '',
      status: ''
    };

    setSearchFilters(initialFilters);

    // 날짜 범위만으로 필터링 (다른 필드들은 빈 값이므로 필터링하지 않음)
    const resetFiltered = salesData.filter(item => {
      const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
        (!initialFilters.endDate || item.date <= initialFilters.endDate);
      return matchesDateRange;
    });
    setFilteredData(resetFiltered);
    setCurrentPage(1);
  };

  // 페이지네이션 상태변수 및 관련 로직
  const [itemsPerPage, setItemsPerPage] = useState(10); // 페이지당 아이템 수 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  // totalItems 계산 - 필터링된 데이터의 총 개수
  const totalItems = filteredData.length;
  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // 페이지 사이즈 변경 핸들러
  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // 페이지 사이즈 변경 시 첫 페이지로 이동
  };

  // 통계 계산
  const todaySales = filteredData.reduce((sum, item) => {
    // 선택된 필터에 따라 다른 금액을 합산
    if (searchFilters.status === 'COMPLETED') {
      // 완료 필터: 완료된 주문의 최종 금액만 합산
      return item.status === 'COMPLETED' ? sum + item.finalAmount : sum;
    } else if (searchFilters.status === 'CANCELLED') {
      // 취소 필터: 취소된 주문의 취소 금액을 마이너스로 합산
      return item.status === 'CANCELLED' ? sum - item.cancelAmount : sum;
    } else if (searchFilters.status === 'PARTIAL_CANCELLED') {
      // 부분취소 필터: 부분취소된 주문의 취소 금액을 마이너스로 합산
      return item.status === 'PARTIAL_CANCELLED' ? sum - item.cancelAmount : sum;
    } else {
      // 전체 필터: 정상결제 + 부분취소금액을 뺀 남은 금액
      switch (item.status) {
        case 'COMPLETED':
          return sum + item.finalAmount;
        case 'PARTIAL_CANCELLED':
          return sum + item.finalAmount;
        default:
          return sum;
      }
    }
  }, 0);

  const completedCount = filteredData.filter(item =>
    item.status === 'COMPLETED' ||
    item.status === 'CANCELLED' ||
    item.status === 'PARTIAL_CANCELLED'
  ).length;
  const avgTransaction = filteredData.length > 0 ? Math.round(todaySales / filteredData.length) : 0;

  // 상태값 뱃지 반환
  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { text: '완료', className: styles.completed },
      CANCELLED: { text: '취소', className: styles.cancelled },
      PARTIAL_CANCELLED: { text: '부분취소', className: styles.partial_cancelled }
    };
    const config = statusConfig[status] || { text: status, className: '' };
    return <span className={`${styles.statusBadge} ${config.className}`}>{config.text}</span>;
  };

  // 항목을 인자로 받아 삭제 처리
  const handleDelete = (item) => {
    showConfirm(
      '매출 삭제',
      MESSAGES.SALES.DELETE_CONFIRM(item.customerName),
      async () => {
        closeModal();
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`${API_BASE_URL}/sales/${item.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            const errorMessage = parseErrorMessage(response, MESSAGES.SALES.DELETE_ERROR);
            showError('삭제 실패', errorMessage);
            return;
          }

          // ✅ 삭제 성공 → 데이터 다시 불러오기
          await fetchSalesData(API_BASE_URL, setIsLoading, setSalesData, setFilteredData, getInitialDateFilters, setCurrentPage, showMessage);
        } catch (err) {
          console.error('매출 삭제 실패:', err);
          showError('삭제 오류', MESSAGES.COMMON.NETWORK_ERROR);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // 에러 메시지 파싱 함수
  const parseErrorMessage = (response, defaultMessage) => {
    if (response.status === 400) return MESSAGES.COMMON.VALIDATION_ERROR;
    if (response.status === 409) return MESSAGES.SALES.DUPLICATE_ERROR;
    if (response.status === 404) return MESSAGES.SALES.NOT_FOUND;
    if (response.status === 500) return MESSAGES.COMMON.SERVER_ERROR;
    return defaultMessage;
  };


  // 숫자 포맷 (3자리마다 콤마)
  const formatNumber = (num) => num.toLocaleString('ko-KR');

  // 로딩 중일 경우 출력
  if (isLoading) {
    return (
      <div className="content-card">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div>매출 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">

      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>매출조회/등록</h1>
            <p>매출 내역을 조회하고 새로운 매출을 등록할 수 있습니다.</p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/myshop/sales/register" className={styles.primaryButton}>
              매출 등록
            </Link>
            <button className={styles.secondaryButton} onClick={handleExcelDownload}>
              엑셀다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 매출 통계 */}
      <div className={styles.statsContainer}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statTitle}>총 금액</div>
          <div className={styles.statValue} style={{ color: todaySales < 0 ? 'var(--color-error)' : 'inherit' }}>{formatNumber(todaySales)}원</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statTitle}>완료된 건수</div>
          <div className={styles.statValue}>{completedCount}건</div>
        </div>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statTitle}>평균 객단가</div>
          <div className={styles.statValue}>{formatNumber(avgTransaction)}원</div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statTitle}>총 결제 고객수</div>
          <div className={styles.statValue}>{filteredData.length}명</div>
        </div>
      </div>

      {/* 검색 필터 */}
      <div className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <h3 className={styles.searchTitle}>🔍 매출 검색</h3>
          <button className={styles.resetButton} onClick={handleReset}>
            초기화
          </button>
        </div>
        <div className={styles.searchGrid}>
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>시작일</label>
            <input
              type="date"
              className={styles.searchInput}
              value={searchFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>종료일</label>
            <input
              type="date"
              className={styles.searchInput}
              value={searchFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>고객명</label>
            <input
              type="text"
              placeholder="고객명 입력"
              className={styles.searchInput}
              value={searchFilters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
            />
          </div>
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>시술명</label>
            <input
              type="text"
              placeholder="시술명 입력"
              className={styles.searchInput}
              value={searchFilters.serviceName}
              onChange={(e) => handleFilterChange('serviceName', e.target.value)}
            />
          </div>
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>상태</label>
            <select
              className={styles.searchSelect}
              value={searchFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">전체</option>
              <option value="COMPLETED">정상결제</option>
              <option value="CANCELLED">전체취소</option>
              <option value="PARTIAL_CANCELLED">부분취소</option>
            </select>
          </div>
        </div>
      </div>

      {/* 매출 테이블 */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>매출 내역</h3>
          <span className={styles.tableInfo}>총 {filteredData.length}건</span>
        </div>

        {currentData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>시술일시</th>
                <th>고객정보</th>
                <th>시술명</th>
                <th>금액</th>
                <th>결제방법</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div>{item.date}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.time}</div>
                  </td>
                  <td>
                    <div>{item.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.customerPhone}</div>
                  </td>
                  <td>
                    <div>{item.serviceName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#565555ff' }}>{formatNumber(item.servicePrice)}원</div>
                    {/* 할인 금액 또는 취소/부분취소 여부 표시 로직 변경 */}
                    {item.status === 'CANCELLED' || item.status === 'PARTIAL_CANCELLED' ? (
                      <div style={{ fontSize: '12px', color: '#ef4444' }}>
                        취소: -{formatNumber(item.cancelAmount)}원
                      </div>
                    ) : (
                      item.discount > 0 && (
                        <div style={{ fontSize: '12px', color: '#16b530ff' }}>
                          할인: -{formatNumber(item.discount)}원
                        </div>
                      )
                    )}
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {formatNumber(item.finalAmount)} 원
                    </div>
                  </td>
                  <td>{item.paymentMethod}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={`${styles.actionButton} ${styles.editButton}`}>
                        수정
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(item)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3 className={styles.emptyTitle}>매출 데이터가 없습니다</h3>
            <p className={styles.emptyDescription}>
              검색 조건을 변경하거나 새로운 매출을 등록해보세요.
            </p>
          </div>
        )}
      </div>
      {/* 페이지네이션 - 컴포넌트 사용 */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showPageSizeSelector={true}
        showFirstLast={true}
      />

      {/* 메시지 모달 */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        showCancel={modal.showCancel}
        confirmText={modal.type === 'confirm' ? '삭제' : '확인'}
        cancelText="취소"
      />
    </div>
  );
}
