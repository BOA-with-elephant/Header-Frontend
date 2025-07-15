"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/admin/sales/SalesManagement.module.css";

import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function SalesManagement() {
  // 상수 정의
  const itemsPerPage = 10;
  const SHOP_CODE = 1; // TODO: 실제 샵 코드에 따라 동적으로 변경하기
  const API_BASE_URL = `http://localhost:8080/api/v1/myshop/${SHOP_CODE}`;

  // 현재 월의 시작일과 종료일을 계산하는 함수
  const getInitialDateFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, today.getMonth() + 1, 0).toISOString().split('T')[0]; // 다음 달의 0번째 날 = 이번 달의 마지막 날
    return { startDate: firstDay, endDate: lastDay };
  };

  // 상태 변수 정의
  const [salesData, setSalesData] = useState([]); // 전체 매출 데이터 (필터링 전 원본)
  const [filteredData, setFilteredData] = useState([]); // 필터링된 매출 데이터
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [searchFilters, setSearchFilters] = useState(getInitialDateFilters()); // 초기 검색 필터를 현재 월로 설정

  // 메시지 모달 훅 사용
  const { showMessage, MessageModalComponent } = useMessageModal();

  // 컴포넌트 마운트 시 데이터 로딩 및 초기 필터 적용
  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/sales`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // API 응답 데이터 구조에 맞게 매핑 (SalesDetailDTO와 일치하도록)
        const formattedData = data.map(item => ({
          id: item.salesCode,
          date: item.resvDate, // YYYY-MM-DD 형식이라고 가정
          time: item.resvTime, // HH:MM:SS 형식이라고 가정
          customerName: item.userName,
          customerPhone: '', // 백엔드 DTO에 필드가 없어 빈 문자열로 처리
          serviceName: item.menuName,
          servicePrice: item.menuPrice,
          discount: item.menuPrice - item.finalAmount,
          finalAmount: item.finalAmount,
          paymentMethod: item.payMethod,
          status: item.payStatus, // enum 값 (COMPLETED, CANCELLED, PARTIAL_CANCELLED)
          memo: '', // 백엔드 DTO에 필드가 없어 빈 문자열로 처리
          cancelAmount: item.cancelAmount
        }));

        setSalesData(formattedData); // 전체 데이터 저장

        // 초기 로드 시 현재 월 필터 적용
        const initialFilters = getInitialDateFilters();
        const initiallyFiltered = formattedData.filter(item => {
          // item.date가 Date 객체가 아닌 'YYYY-MM-DD' 문자열이므로 문자열 비교
          const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
                                   (!initialFilters.endDate || item.date <= initialFilters.endDate);
          return matchesDateRange;
        });
        setFilteredData(initiallyFiltered); // 현재 월 데이터로 필터링된 데이터 설정
        setCurrentPage(1); // 첫 페이지로 이동

      } catch (error) {
        console.error("매출 데이터를 불러오는 중 오류 발생:", error);
        showMessage(MESSAGES.ERROR_FETCHING_SALES_DATA);
        setSalesData([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [SHOP_CODE, showMessage, API_BASE_URL]); // 의존성 배열 유지

  // 검색 필터 변경 시 상태 업데이트
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    const filtered = salesData.filter(item => {
      const matchesDateRange = (!searchFilters.startDate || item.date >= searchFilters.startDate) &&
                               (!searchFilters.endDate || item.date <= searchFilters.endDate);
      const matchesCustomer = !searchFilters.customerName || item.customerName.toLowerCase().includes(searchFilters.customerName.toLowerCase());
      const matchesService = !searchFilters.serviceName || item.serviceName.toLowerCase().includes(searchFilters.serviceName.toLowerCase());
      const matchesStatus = !searchFilters.status || item.status === searchFilters.status;
      return matchesDateRange && matchesCustomer && matchesService && matchesStatus;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // 검색 초기화 핸들러
  const handleReset = () => {
    // 필터 초기화 시 현재 월로 다시 설정
    const initialFilters = getInitialDateFilters();
    setSearchFilters(initialFilters);

    // 초기화된 필터로 전체 salesData에서 다시 필터링
    const resetFiltered = salesData.filter(item => {
      const matchesDateRange = (!initialFilters.startDate || item.date >= initialFilters.startDate) &&
                               (!initialFilters.endDate || item.date <= initialFilters.endDate);
      return matchesDateRange;
    });
    setFilteredData(resetFiltered);
    setCurrentPage(1);
  };

  // 페이징 처리
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // 통계 계산
  const todaySales = filteredData.reduce((sum, item) => {
    // 취소 또는 부분 취소된 금액은 총 매출에서 마이너스로 처리
    if (item.status === 'CANCELLED' || item.status === 'PARTIAL_CANCELLED') {
      return sum - item.cancelAmount;
    }
    return sum + item.finalAmount; // 완료된 금액은 정상적으로 합산
  }, 0);

  const completedCount = filteredData.filter(item => item.status === 'COMPLETED').length;
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
      {/* 메시지 모달 컴포넌트 */}
      <MessageModal />

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
            <button className={styles.secondaryButton}>
              엑셀다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 매출 통계 */}
      <div className={styles.statsContainer}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statTitle}>총 금액</div>
          <div className={styles.statValue}>{formatNumber(todaySales)}원</div>
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
        <h3 className={styles.searchTitle}>🔍 매출 검색</h3>
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
              <option value="COMPLETED">완료</option>
              <option value="CANCELLED">취소</option>
              <option value="PARTIAL_CANCELLED">부분취소</option>
            </select>
          </div>
        </div>
        <div className={styles.searchActions}>
          <button className={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
          <button className={styles.resetButton} onClick={handleReset}>
            초기화
          </button>
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
                <th>날짜/시간</th>
                <th>고객정보</th>
                <th>시술내용</th>
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
                    {item.memo && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.memo}</div>
                    )}
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
                      <button className={`${styles.actionButton} ${styles.deleteButton}`}>
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
