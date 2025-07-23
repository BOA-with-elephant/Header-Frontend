'use client';
import React, { useState } from 'react';
import styles from "@/styles/common/Pagination.module.css";

const AdvancedPagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange = () => {}, // Add default empty function
  showFirstLast = false,
  maxVisiblePages = 10,
  showPageSizeSelector = true,
  showItemInfo = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = ""
}) => {
  const [inputPage, setInputPage] = useState('');

  if (totalPages <= 1 && !showPageSizeSelector) return null;

  // 현재 페이지의 아이템 범위 계산
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 표시할 페이지 번호 범위 계산
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // 페이지 직접 입력 핸들러
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputPage('');
    }
  };

  // 페이지 사이즈 변경 핸들러
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    
    // Check if onPageSizeChange is provided and is a function
    if (typeof onPageSizeChange === 'function') {
      onPageSizeChange(newSize);
      // 새로운 페이지 사이즈에 맞게 현재 페이지 조정
      const newTotalPages = Math.ceil(totalItems / newSize);
      if (currentPage > newTotalPages) {
        onPageChange(newTotalPages);
      }
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      {/* 페이지 정보 및 사이즈 선택 */}
      <div className={styles.paginationInfo}>
        {showItemInfo && (
          <span className={styles.itemInfo}>
            {startItem}-{endItem} / {totalItems}개
          </span>
        )}
        
        {showPageSizeSelector && (
          <div className={styles.pageSizeSelector}>
            <label>
              페이지당 
              <select 
                value={itemsPerPage} 
                onChange={handlePageSizeChange}
                className={styles.pageSizeSelect}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              개씩
            </label>
          </div>
        )}
      </div>

      {/* 페이지네이션 버튼들 */}
      <div className={styles.pagination}>
        {/* 첫 페이지 버튼 */}
        {showFirstLast && currentPage > 1 && (
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(1)}
            title="첫 페이지"
          >
            ≪
          </button>
        )}

        {/* 이전 페이지 버튼 */}
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 시작 생략 표시 */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              className={styles.paginationButton}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className={styles.ellipsis}>...</span>
            )}
          </>
        )}

        {/* 페이지 번호 버튼들 */}
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`${styles.paginationButton} ${
              page === currentPage ? styles.active : ''
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* 끝 생략 표시 */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <button
              className={styles.paginationButton}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>

        {/* 마지막 페이지 버튼 */}
        {showFirstLast && currentPage < totalPages && (
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(totalPages)}
            title="마지막 페이지"
          >
            ≫
          </button>
        )}
      </div>

      {/* 페이지 직접 입력 */}
      <div className={styles.pageJump}>
        <form onSubmit={handleGoToPage} className={styles.pageJumpForm}>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder="페이지"
            className={styles.pageJumpInput}
          />
          <button type="submit" className={styles.pageJumpButton}>
            이동
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvancedPagination;