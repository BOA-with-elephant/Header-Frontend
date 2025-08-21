"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/admin/sales/SalesManagement.module.css";
import Pagination from "@/components/ui/AdvancedPagination";
import MessageModal from '@/components/ui/MessageModal';
import AddEditSalesModal from './components/AddEditSalesModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function SalesManagement() {
  // 상수 정의
  const SHOP_CODE = 1;
  // const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}`;
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}`;

  // 현재 월의 시작일과 종료일을 계산하는 함수
  const getInitialDateFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = today.toISOString().split('T')[0];
    return { startDate: firstDay, endDate: lastDay };
  };

  // 상태 변수 정의
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState(getInitialDateFilters());
  const [customers, setCustomers] = useState([]); // 예약에서 추출한 고객 목록
  const [menus, setMenus] = useState([]); // 예약에서 추출한 메뉴 목록 (기본값용)
  const [reservationData, setReservationData] = useState([]); // 전체 예약 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 매출 모달 상태
  const [editingItem, setEditingItem] = useState(null); // 수정할 매출 항목
  
  const { modal, closeModal, showError, showConfirm, showSuccess } = useMessageModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 예약 데이터에서 고객 목록 추출 (BossResvProjectionDTO 구조)
  const extractCustomersFromReservations = (reservations) => {
    const customerMap = new Map();
    reservations.forEach(reservation => {
      if (reservation.userName && reservation.userPhone) {
        const key = `${reservation.userName}_${reservation.userPhone}`;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            userCode: reservation.userCode || Math.floor(Math.random() * 10000) + 1000,
            userName: reservation.userName,
            userPhone: reservation.userPhone
          });
        }
      }
    });
    return Array.from(customerMap.values());
  };

  // 예약 데이터에서 기본 메뉴 목록 추출 (모달에서 직접 선택할 때 사용)
  const extractMenusFromReservations = (reservations) => {
    const menuMap = new Map();
    reservations.forEach(reservation => {
      if (reservation.menuName) {
        const key = reservation.menuName;
        if (!menuMap.has(key)) {
          menuMap.set(key, {
            menuCode: Math.floor(Math.random() * 10000) + 1000,
            menuName: reservation.menuName,
            menuPrice: 50000, // 기본값 (모달에서 실제 API로 가격 조회)
            menuColor: reservation.menuColor || '#007bff',
            categoryName: '기본'
          });
        }
      }
    });
    return Array.from(menuMap.values());
  };

  // 예약 데이터 불러오기 및 고객/기본메뉴 정보 추출
  const fetchReservationData = async () => {
    try {
      // 최근 3개월간의 예약 데이터를 가져와서 고객/메뉴 정보 구성
      const today = new Date();
      const reservations = [];
      
      // 월별로 데이터 수집
      for (let i = 0; i < 4; i++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        
        try {
          // const response = await fetch(`http://localhost:8080/my-shops/${SHOP_CODE}/reservation?date=${yearMonth}`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/my-shops/${SHOP_CODE}/reservation?date=${yearMonth}`);
          if (response.ok) {
            const monthData = await response.json();
            if (Array.isArray(monthData)) {
              reservations.push(...monthData);
            }
          }
        } catch (error) {
          console.warn(`${yearMonth} 예약 데이터 로딩 실패:`, error);
        }
      }

      setReservationData(reservations);
      
      // 예약 데이터에서 고객과 기본 메뉴 정보 추출
      const extractedCustomers = extractCustomersFromReservations(reservations);
      const extractedMenus = extractMenusFromReservations(reservations);
      
      setCustomers(extractedCustomers);
      setMenus(extractedMenus);
      
      console.log('추출된 고객 목록:', extractedCustomers);
      console.log('추출된 기본 메뉴 목록:', extractedMenus);
      
    } catch (error) {
      console.error('예약 데이터 로딩 실패:', error);
      setCustomers([]);
      setMenus([]);
      setReservationData([]);
    }
  };

  async function fetchSalesData() {
    setIsLoading(true);
    try {
      console.log('매출 데이터 조회 시작:', `${API_BASE_URL}/sales/active`);
      
      const response = await fetch(`${API_BASE_URL}/sales/active`);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('받은 매출 데이터:', data);
      console.log('데이터 타입:', typeof data, '배열인가?', Array.isArray(data));

      if (!Array.isArray(data)) {
        console.warn('매출 데이터가 배열이 아님:', data);
        setSalesData([]);
        setFilteredData([]);
        setCurrentPage(1);
        return;
      }

      const formattedData = data.map((item, index) => {
        console.log(`매출 항목 ${index}:`, item);
        
        return {
          id: item.salesCode,
          salesCode: item.salesCode,
          userCode: item.userCode,
          menuCode: item.menuCode,
          date: item.resvDate,
          time: item.resvTime,
          customerName: item.userName,
          customerPhone: item.userPhone,
          serviceName: item.menuName,
          servicePrice: item.menuPrice,
          discount: (item.menuPrice || 0) - (item.finalAmount || 0),
          finalAmount: item.finalAmount,
          paymentMethod: item.payMethod,
          status: item.payStatus,
          memo: item.userComment,
          cancelAmount: item.cancelAmount || 0,
          cancelReason: item.cancelReason
        };
      });

      console.log('포맷된 데이터:', formattedData);
      setSalesData(formattedData);

      // 초기 필터 설정 - 더 넓은 범위로 설정
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const initialFilters = {
        startDate: threeMonthsAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
      console.log('초기 필터:', initialFilters);
      
      const initiallyFiltered = formattedData.filter(item => {
        const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
          (!initialFilters.endDate || item.date <= initialFilters.endDate);
        console.log(`항목 ${item.id} 날짜 체크:`, item.date, '범위:', initialFilters.startDate, '~', initialFilters.endDate, '통과:', matchesDateRange);
        return matchesDateRange;
      });
      
      console.log('필터 후 데이터:', initiallyFiltered);
      setFilteredData(initiallyFiltered);
      setCurrentPage(1);

    } catch (error) {
      console.error("매출 데이터를 불러오는 중 오류 발생:", error);
      showError('데이터 로딩 실패', `매출 데이터를 불러올 수 없습니다: ${error.message}`);
      setSalesData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSalesData();
    fetchReservationData(); // 예약 데이터에서 고객/기본메뉴 정보 추출
  }, []);

  // 매출 등록 버튼 클릭
  const handleAddSales = () => {
    console.log('매출 등록 버튼 클릭');
    setEditingItem(null);
    setIsModalOpen(true);
    console.log('모달 상태 변경:', { isModalOpen: true, editingItem: null });
  };

  // 매출 수정 버튼 클릭
  const handleEditSales = (item) => {
    console.log('매출 수정 버튼 클릭:', item);
    setEditingItem(item);
    setIsModalOpen(true);
    console.log('모달 상태 변경:', { isModalOpen: true, editingItem: item });
  };

  // 매출 모달 닫기
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 매출 모달 성공 처리 (showSuccess 사용)
  const handleModalSuccess = () => {
    fetchSalesData(); // 데이터 새로고침
    showSuccess(
      '등록/수정 완료', 
      editingItem ? MESSAGES.SALES.UPDATE_SUCCESS : MESSAGES.SALES.CREATE_SUCCESS
    );
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
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

  // 검색 필터 변경
  const handleFilterChange = (field, value) => {
    const newFilters = { ...searchFilters, [field]: value };
    setSearchFilters(newFilters);

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

  // 검색 초기화
  const handleReset = () => {
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

    const resetFiltered = salesData.filter(item => {
      const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
        (!initialFilters.endDate || item.date <= initialFilters.endDate);
      return matchesDateRange;
    });
    setFilteredData(resetFiltered);
    setCurrentPage(1);
  };

  // 페이지네이션 상태
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalItems = filteredData.length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // 통계 계산
  const todaySales = filteredData.reduce((sum, item) => {
    if (searchFilters.status === 'COMPLETED') {
      return item.status === 'COMPLETED' ? sum + item.finalAmount : sum;
    } else if (searchFilters.status === 'CANCELLED') {
      return item.status === 'CANCELLED' ? sum - item.cancelAmount : sum;
    } else if (searchFilters.status === 'PARTIAL_CANCELLED') {
      return item.status === 'PARTIAL_CANCELLED' ? sum - item.cancelAmount : sum;
    } else {
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

  // 상태 뱃지
  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { text: '완료', className: styles.completed },
      CANCELLED: { text: '취소', className: styles.cancelled },
      PARTIAL_CANCELLED: { text: '부분취소', className: styles.partial_cancelled }
    };
    const config = statusConfig[status] || { text: status, className: '' };
    return <span className={`${styles.statusBadge} ${config.className}`}>{config.text}</span>;
  };

  // 삭제 처리
  const handleDelete = (item) => {
    showConfirm(
      '매출 삭제',
      MESSAGES.SALES.DELETE_CONFIRM(item.customerName),
      async () => {
        closeModal();
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`${API_BASE_URL}/sales/${item.salesCode}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            const errorMessage = parseErrorMessage(response, MESSAGES.SALES.DELETE_ERROR);
            showError('삭제 실패', errorMessage);
            return;
          }

          await fetchSalesData();
          showSuccess('삭제 완료', MESSAGES.SALES.DELETE_SUCCESS);
        } catch (err) {
          console.error('매출 삭제 실패:', err);
          showError('삭제 오류', MESSAGES.COMMON.NETWORK_ERROR);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // 에러 메시지 파싱
  const parseErrorMessage = (response, defaultMessage) => {
    if (response.status === 400) return MESSAGES.COMMON.VALIDATION_ERROR;
    if (response.status === 409) return MESSAGES.SALES.DUPLICATE_ERROR;
    if (response.status === 404) return MESSAGES.SALES.NOT_FOUND;
    if (response.status === 500) return MESSAGES.COMMON.SERVER_ERROR;
    return defaultMessage;
  };

  // 숫자 포맷
  const formatNumber = (num) => num.toLocaleString('ko-KR');

  if (isLoading) {
    return (
      <div className="content-card">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div>매출 데이터를 불러오는 중...</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            API 호출: {API_BASE_URL}/sales/active
          </div>
        </div>
      </div>
    );
  }

  // 디버깅 정보 표시
  console.log('현재 상태:', {
    salesData: salesData.length,
    filteredData: filteredData.length,
    currentData: currentData.length,
    customers: customers.length,
    menus: menus.length,
    isLoading
  });

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
            <button 
              className={styles.primaryButton}
              onClick={handleAddSales}
            >
              매출 등록
            </button>
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
          <div className={styles.statValue} style={{ color: todaySales < 0 ? 'var(--color-error)' : 'inherit' }}>
            {formatNumber(todaySales)}원
          </div>
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
                      <button 
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => handleEditSales(item)}
                      >
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
              {salesData.length === 0 
                ? '등록된 매출이 없습니다. 예약에서 매출을 등록해보세요.' 
                : '검색 조건에 맞는 매출이 없습니다. 검색 조건을 변경해보세요.'}
            </p>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              전체 매출: {salesData.length}건 | 필터 후: {filteredData.length}건
            </div>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
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

      {/* 매출 등록/수정 모달 */}
      <AddEditSalesModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={editingItem}
        customers={customers}
        menus={menus}
        reservationData={reservationData}
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