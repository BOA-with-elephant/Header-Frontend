'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/styles/admin/message/MessageDetail.module.css';

export default function MessageDetail() {
    const router = useRouter();
    const params = useParams();
    const messageId = params?.messageId;

    // 배치 정보 상태
    const [batchInfo, setBatchInfo] = useState(null);

    // 수신자 리스트 상태
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 현재 페이지 상태 (수신자 리스트 페이지네이션)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 임시 shopId
    const SHOP_ID = 2;

    // 컴포넌트 마운트 시 데이터 불러오기
    useEffect(() => {
        console.log('useEffect 실행됨, messageId:', messageId);
        if (messageId) {
            console.log('fetchBatchInfo 호출 시작');
            fetchBatchInfo();
            fetchRecipients();
        } else {
            console.log('messageId가 없음');
        }
    }, [messageId, currentPage]);

    // 배치 정보 API 호출
    const fetchBatchInfo = async () => {
        try {
            console.log('fetchBatchInfo 함수 실행됨');
            // TODO: API 요청 구현
            // const response = await fetch(`/api/v1/my-shops/${SHOP_ID}/messages/${messageId}`);
            // const data = await response.json();
            // setBatchInfo(data.batchInfo);

            // 임시 더미 데이터
            const dummyBatchInfo = {
                date: '2025.07.08',
                time: '10:00',
                type: 'GROUP',
                title: '개업 1주년 이벤트 안내',
                totalCount: 30,
                successCount: 28,
                failureCount: 2
                // content는 제거 - 각 히스토리에서 가져옴
            };

            console.log('setBatchInfo 호출됨:', dummyBatchInfo);
            setBatchInfo(dummyBatchInfo);

        } catch (error) {
            console.error('배치 정보 불러오기 실패:', error);
            setError('배치 정보를 불러오는데 실패했습니다.');
        }
    };

    // 수신자 리스트 API 호출
    const fetchRecipients = async () => {
        try {
            setLoading(true);

            // TODO: API 요청 구현
            // const response = await fetch(`/api/v1/my-shops/${SHOP_ID}/messages/${messageId}/recipients?page=${currentPage}`);
            // const data = await response.json();
            // setRecipients(data.recipients);
            // setTotalPages(data.totalPages);

            // 임시 더미 데이터
            const dummyRecipients = [
                {
                    no: 1,
                    sendTime: '10:00:02',
                    recipient: '김민수',
                    status: '성공',
                    statusCode: 'SUCCESS',
                    content: `안녕하세요 김민수 님!
여름 맞이 이벤트 진행중입니다.
시원하게 머리 자르러 오세요!!
최대 30% 할인 중!!!
감사합니다. - BOA 미용실`
                },
                {
                    no: 2,
                    sendTime: '10:00:23',
                    recipient: '이민정',
                    status: '성공',
                    statusCode: 'SUCCESS',
                    content: `안녕하세요 이민정 님!
여름 맞이 이벤트 진행중입니다.
시원하게 머리 자르러 오세요!!
최대 30% 할인 중!!!
감사합니다. - BOA 미용실`
                },
                {
                    no: 3,
                    sendTime: '10:00:21',
                    recipient: '차현미',
                    status: '실패',
                    statusCode: 'FAILURE',
                    failureReason: '수신거부',
                    content: `안녕하세요 차현미 님!
여름 맞이 이벤트 진행중입니다.
시원하게 머리 자르러 오세요!!
최대 30% 할인 중!!!
감사합니다. - BOA 미용실`
                }
            ];

            setRecipients(dummyRecipients);
            setTotalPages(1);

            // 첫 번째 수신자를 기본 선택
            if (dummyRecipients.length > 0 && !selectedRecipient) {
                setSelectedRecipient(dummyRecipients[0]);
            }

        } catch (error) {
            console.error('수신자 리스트 불러오기 실패:', error);
            setError('수신자 리스트를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 목록으로 돌아가기
    const handleBackToList = () => {
        router.push('/myshop/message/list');
    };

    // 수신자 선택
    const handleRecipientSelect = (recipient) => {
        console.log('수신자 선택됨:', recipient);
        setSelectedRecipient(recipient);
    };

    // 페이지 변경
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 발송 상태에 따른 스타일 클래스
    const getStatusClass = (statusCode) => {
        switch (statusCode) {
            case 'SUCCESS':
                return styles.statusSuccess;
            case 'FAILURE':
                return styles.statusFailure;
            case 'PENDING':
                return styles.statusPending;
            default:
                return '';
        }
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

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

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>발송 내역 상세조회</h1>
                <button
                    onClick={handleBackToList}
                    className={styles.backButton}
                >
                    목록으로 돌아가기
                </button>
            </div>

            <div className={styles.content}>
                {/* 좌측 영역 */}
                <div className={styles.leftSection}>
                    {/* 배치 정보 */}
                    {batchInfo ? (
                        <div className={styles.batchInfo}>
                            <h2 className={styles.sectionTitle}>발송 정보</h2>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>날짜</span>
                                    <span className={styles.infoValue}>{batchInfo.date}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>시간</span>
                                    <span className={styles.infoValue}>{batchInfo.time}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>타입</span>
                                    <span className={styles.infoValue}>
                                        <span className={`${styles.typeTag} ${batchInfo.type === 'GROUP' ? styles.groupType : styles.individualType
                                            }`}>
                                            {batchInfo.type === 'GROUP' ? '그룹' : '개별'}
                                        </span>
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>제목</span>
                                    <span className={styles.infoValue}>{batchInfo.title}</span>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.statisticsGrid}>
                                <div className={styles.statisticsItem}>
                                    <span className={styles.statisticsLabel}>총 발송 개수</span>
                                    <span className={styles.statisticsValue}>{batchInfo.totalCount}</span>
                                </div>
                                <div className={styles.statisticsItem}>
                                    <span className={styles.statisticsLabel}>성공 개수</span>
                                    <span className={`${styles.statisticsValue} ${styles.successValue}`}>
                                        {batchInfo.successCount}
                                    </span>
                                </div>
                                <div className={styles.statisticsItem}>
                                    <span className={styles.statisticsLabel}>실패 개수</span>
                                    <span className={`${styles.statisticsValue} ${styles.failureValue}`}>
                                        {batchInfo.failureCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.batchInfo}>
                            <div className={styles.loading}>배치 정보 로딩 중... (batchInfo: {JSON.stringify(batchInfo)})</div>
                        </div>
                    )}

                    {/* 메시지 내용 */}
                    <div className={styles.messageContent}>
                        <h2 className={styles.sectionTitle}>메시지 내용</h2>
                        <div className={styles.messageBox}>
                            {selectedRecipient ? (
                                <div className={styles.messageText}>
                                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                                        선택된 수신자: {selectedRecipient.recipient} (No.{selectedRecipient.no})
                                    </div>
                                    {selectedRecipient.content || '메시지 내용이 없습니다.'}
                                </div>
                            ) : (
                                <div className={styles.noSelection}>
                                    수신자를 선택하면 메시지 내용이 표시됩니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 우측 영역 - 수신자 목록 */}
                <div className={styles.rightSection}>
                    <h2 className={styles.sectionTitle}>수신자 목록</h2>

                    {loading ? (
                        <div className={styles.loading}>로딩 중...</div>
                    ) : (
                        <>
                            <div className={styles.recipientList}>
                                <div className={styles.listHeader}>
                                    <div className={styles.headerItem}>No</div>
                                    <div className={styles.headerItem}>발송시간</div>
                                    <div className={styles.headerItem}>수신자</div>
                                    <div className={styles.headerItem}>발송상태</div>
                                    <div className={styles.headerItem}>비고</div>
                                </div>

                                <div className={styles.listBody}>
                                    {recipients.map((recipient) => (
                                        <div
                                            key={recipient.no}
                                            className={`${styles.listRow} ${selectedRecipient?.no === recipient.no ? styles.selected : ''
                                                }`}
                                            onClick={() => {
                                                console.log('리스트 행 클릭됨:', recipient);
                                                handleRecipientSelect(recipient);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={styles.listItem}>{recipient.no}</div>
                                            <div className={styles.listItem}>{recipient.sendTime}</div>
                                            <div className={styles.listItem}>{recipient.recipient}</div>
                                            <div className={styles.listItem}>
                                                <span className={`${styles.statusTag} ${getStatusClass(recipient.statusCode)}`}>
                                                    {recipient.status}
                                                </span>
                                            </div>
                                            <div className={styles.listItem}>
                                                {recipient.failureReason || '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    {renderPagination()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}