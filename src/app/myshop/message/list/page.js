'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import styles from '@/styles/admin/message/MessageList.module.css';

export default function MessageList() {
    const router = useRouter();
    
    // API 호출용 훅
    const { execute: executeApi, loading, error: apiError } = useApi();
    
    // 메시지 리스트 상태
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]); // 전체 메시지 데이터

    // 필터 상태
    const [filters, setFilters] = useState({
        type: '', // 'GROUP' 또는 'INDIVIDUAL'
        dateFrom: '',
        dateTo: ''
    });

    // 현재 페이지 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // TODO: shop_id를 context나 store에서 가져오도록 수정
    const SHOP_ID = 2;

    // 컴포넌트 마운트 시 메시지 목록 불러오기
    useEffect(() => {
        fetchMessages();
    }, []);

    // 필터 변경 시 필터링 처리
    useEffect(() => {
        applyFilters();
    }, [allMessages, filters, currentPage]);

    // 메시지 목록 조회 (새로운 API 패턴 사용)
    const fetchMessages = async () => {
        try {
            const response = await executeApi(MessagesAPI.getMessageHistory, SHOP_ID);
            setAllMessages(response.data || []); // 전체 데이터 저장
        } catch (error) {
            console.error('메시지 목록 불러오기 실패:', error);
            // useApi 훅에서 에러 상태를 관리하므로 별도 처리 불필요
            setAllMessages([]);
        }
    };

    // 프론트에서 필터링 처리
    const applyFilters = () => {
        let filteredMessages = [...allMessages];

        // 타입 필터링
        if (filters.type) {
            filteredMessages = filteredMessages.filter(message => message.type === filters.type);
        }

        // 날짜 필터링
        if (filters.dateFrom) {
            filteredMessages = filteredMessages.filter(message => {
                const messageDate = message.date?.replace(/\./g, '-'); // "2025.07.21" -> "2025-07-21"
                return messageDate >= filters.dateFrom;
            });
        }

        if (filters.dateTo) {
            filteredMessages = filteredMessages.filter(message => {
                const messageDate = message.date?.replace(/\./g, '-'); // "2025.07.21" -> "2025-07-21"
                return messageDate <= filters.dateTo;
            });
        }

        // 페이지네이션 처리
        const itemsPerPage = 10; // 페이지당 아이템 수
        const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

        setMessages(paginatedMessages);
        setTotalPages(totalPages);
        setTotalCount(filteredMessages.length);
    };

    // 필터 변경 처리
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setCurrentPage(1); // 필터 변경 시 첫 페이지로
    };

    // 필터 초기화
    const handleResetFilters = () => {
        setFilters({
            type: '',
            dateFrom: '',
            dateTo: ''
        });
        setCurrentPage(1);
    };

    // 상세 조회 페이지로 이동
    const handleDetailView = (message) => {
        const queryParams = new URLSearchParams({
            date: message.date || '',
            time: message.time || '',
            type: message.type || '',
            title: message.subject || '',
            totalCount: message.sendCount || '0'
        });

        router.push(`/myshop/message/list/detail/${message.id}?${queryParams.toString()}`);
    };

    // 페이지 변경 처리
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        // 이전 페이지 버튼
        if (currentPage > 1) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={styles.paginationButton}
                    disabled={loading}
                >
                    &lt;
                </button>
            );
        }

        // 페이지 번호 버튼들
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`${styles.paginationButton} ${currentPage === i ? styles.active : ''}`}
                    disabled={loading}
                >
                    {i}
                </button>
            );
        }

        // 다음 페이지 버튼
        if (currentPage < totalPages) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={styles.paginationButton}
                    disabled={loading}
                >
                    &gt;
                </button>
            );
        }

        return pages;
    };

    // 로딩 및 에러 처리
    if (loading && allMessages.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>발송 이력</h1>
                <div className={styles.loading}>메시지 목록을 불러오는 중...</div>
            </div>
        );
    }

    if (apiError && allMessages.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>발송 이력</h1>
                <div className={styles.error}>
                    <p>메시지 목록을 불러오는데 실패했습니다.</p>
                    <p>{apiError}</p>
                    <button 
                        onClick={fetchMessages}
                        className={styles.retryButton}
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>발송 이력</h1>

            {/* 필터 영역 */}
            <div className={styles.filterSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>발송 유형</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className={styles.filterSelect}
                        disabled={loading}
                    >
                        <option value="">전체</option>
                        <option value="GROUP">그룹 발송</option>
                        <option value="INDIVIDUAL">개별 발송</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>기간</label>
                    <div className={styles.dateRange}>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className={styles.dateInput}
                            disabled={loading}
                        />
                        <span className={styles.dateSeparator}>~</span>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className={styles.dateInput}
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleResetFilters}
                    className={styles.resetButton}
                    disabled={loading}
                >
                    초기화
                </button>
            </div>

            {/* 결과 요약 */}
            {!loading && (
                <div className={styles.resultSummary}>
                    <span className={styles.totalCount}>
                        총 {totalCount}개의 메시지
                    </span>
                    {(filters.type || filters.dateFrom || filters.dateTo) && (
                        <span className={styles.filteredCount}>
                            (필터 적용됨)
                        </span>
                    )}
                </div>
            )}

            {/* 메시지 리스트 */}
            <div className={styles.listSection}>
                {loading && allMessages.length > 0 ? (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.loadingSpinner}></div>
                        <span>필터링 중...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📭</div>
                        <h3 className={styles.emptyTitle}>
                            {allMessages.length === 0 
                                ? '발송된 메시지가 없습니다' 
                                : '조건에 맞는 메시지가 없습니다'
                            }
                        </h3>
                        <p className={styles.emptyDescription}>
                            {allMessages.length === 0 
                                ? '새 메시지를 작성해보세요.' 
                                : '필터 조건을 변경하거나 초기화해보세요.'
                            }
                        </p>
                        {allMessages.length === 0 && (
                            <button
                                onClick={() => router.push('/myshop/message')}
                                className={styles.createMessageButton}
                            >
                                새 메시지 작성
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={styles.listHeader}>
                            <div className={styles.headerItem}>날짜</div>
                            <div className={styles.headerItem}>시간</div>
                            <div className={styles.headerItem}>타입</div>
                            <div className={styles.headerItem}>메시지 내용/수신</div>
                            <div className={styles.headerItem}>상세조회</div>
                        </div>

                        <div className={styles.listBody}>
                            {messages.map((message) => (
                                <div key={message.id} className={styles.listRow}>
                                    <div className={styles.listItem}>
                                        {message.date || '-'}
                                    </div>
                                    <div className={styles.listItem}>
                                        {message.time || '-'}
                                    </div>
                                    <div className={styles.listItem}>
                                        <span className={`${styles.typeTag} ${
                                            message.type === 'GROUP' 
                                                ? styles.groupType 
                                                : styles.individualType
                                        }`}>
                                            {message.type === 'GROUP' ? '그룹' : '개별'}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={styles.messageContent}>
                                            {message.subject || '제목 없음'}
                                        </div>
                                        <div className={styles.recipientInfo}>
                                            {`총 ${message.sendCount || 0}건 발송`}
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <button
                                            onClick={() => handleDetailView(message)}
                                            className={styles.detailButton}
                                            disabled={loading}
                                        >
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 페이지네이션 */}
            {!loading && messages.length > 0 && totalPages > 1 && (
                <div className={styles.pagination}>
                    {renderPagination()}
                </div>
            )}
        </div>
    );
}