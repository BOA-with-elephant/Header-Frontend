'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/message/MessageList.module.css';

export default function MessageList() {
    // 메시지 리스트 상태
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // 임시 shopId
    const SHOP_ID = 2;

    // 컴포넌트 마운트 시 메시지 목록 불러오기
    useEffect(() => {
        fetchMessages();
    }, [currentPage, filters]);

    // 메시지 목록 API 호출
    const fetchMessages = async () => {
        try {
            setLoading(true);
            
            // TODO: API 요청 구현
            // const response = await fetch(`/api/v1/my-shops/${SHOP_ID}/messages?page=${currentPage}&type=${filters.type}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`);
            // const data = await response.json();
            // setMessages(data.messages);
            // setTotalPages(data.totalPages);
            // setTotalCount(data.totalCount);

            // 임시 더미 데이터
            const dummyData = [
                {
                    id: 1,
                    date: '25.07.08',
                    time: '10:00',
                    type: 'GROUP',
                    content: '새로운 이벤트 안내',
                    recipientCount: 25
                },
                {
                    id: 2,
                    date: '25.06.29',
                    time: '13:00',
                    type: 'INDIVIDUAL',
                    content: '예약 확인 안내',
                    recipientCount: 1
                },
                {
                    id: 3,
                    date: '25.06.05',
                    time: '11:00',
                    type: 'GROUP',
                    content: '개업 1주년 이벤트 안내',
                    recipientCount: 45
                }
            ];

            setMessages(dummyData);
            setTotalPages(1);
            setTotalCount(dummyData.length);

        } catch (error) {
            console.error('메시지 목록 불러오기 실패:', error);
            setError('메시지 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
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
    const handleDetailView = (messageId) => {
        // TODO: 상세 조회 페이지 라우팅 구현
        console.log('상세 조회:', messageId);
    };

    // 페이지 변경 처리
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
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
                >
                    &gt;
                </button>
            );
        }

        return pages;
    };

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
                        />
                        <span className={styles.dateSeparator}>~</span>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleResetFilters}
                    className={styles.resetButton}
                >
                    초기화
                </button>
            </div>

            {/* 메시지 리스트 */}
            <div className={styles.listSection}>
                {loading ? (
                    <div className={styles.loading}>로딩 중...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : messages.length === 0 ? (
                    <div className={styles.empty}>발송된 메시지가 없습니다.</div>
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
                                    <div className={styles.listItem}>{message.date}</div>
                                    <div className={styles.listItem}>{message.time}</div>
                                    <div className={styles.listItem}>
                                        <span className={`${styles.typeTag} ${
                                            message.type === 'GROUP' ? styles.groupType : styles.individualType
                                        }`}>
                                            {message.type === 'GROUP' ? '그룹' : '개별'}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={styles.messageContent}>{message.content}</div>
                                        <div className={styles.recipientInfo}>
                                            {message.recipientCount}명 발송
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <button 
                                            onClick={() => handleDetailView(message.id)}
                                            className={styles.detailButton}
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
            {!loading && !error && messages.length > 0 && (
                <div className={styles.pagination}>
                    {renderPagination()}
                </div>
            )}
        </div>
    );
}