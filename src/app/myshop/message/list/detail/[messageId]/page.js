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
            console.log('fetchBatchDetails 호출 시작');
            fetchBatchDetails();
        } else {
            console.log('messageId가 없음');
        }
    }, [messageId, currentPage]);

    // 배치 상세 정보 API 호출 (배치 정보 + 수신자 리스트)
    const fetchBatchDetails = async () => {
        try {
            setLoading(true);
            console.log('fetchBatchDetails 함수 실행됨');

            // 실제 API 요청
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_ID}/messages/history/${messageId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '배치 상세 정보를 불러오는데 실패했습니다.');
            }

            // 배치 정보 설정 (파라미터로 받은 기본 정보 + API에서 가져온 통계)
            // TODO: 파라미터로 받은 데이터로 기본 정보 설정 (date, time, type, title, totalCount)
            const batchInfo = {
                date: '2025.07.08',
                time: '10:00', 
                type: 'GROUP',
                title: '개업 1주년 이벤트 안내',
                totalCount: 15, // sendCount 파라미터로 받을 예정
                successCount: result.data.successCount !== null 
                    ? result.data.successCount 
                    : result.data.receivers.filter(r => r.sentStatus === 'SUCCESS').length,
                failureCount: result.data.failCount !== null 
                    ? result.data.failCount 
                    : result.data.receivers.filter(r => r.sentStatus === 'FAIL').length
            };

            setBatchInfo(batchInfo);
            console.log('setBatchInfo 호출됨:', batchInfo);

            // API 응답 데이터를 컴포넌트에서 사용하는 형태로 변환
            const formattedRecipients = result.data.receivers.map((receiver, index) => ({
                no: index + 1,
                sendTime: receiver.sentAt === "-" ? receiver.sentAt : receiver.sentAt.split(' ')[1].substring(0, 8), // "2025-07-15 14:00:10.0" -> "14:00:10"
                recipient: receiver.name,
                status: receiver.sentStatus === 'SUCCESS' ? '성공' : '실패',
                statusCode: receiver.sentStatus,
                failureReason: receiver.sentStatus === 'FAIL' ? (receiver.etc || '알 수 없는 오류') : null,
                content: `안녕하세요 ${receiver.name} 님!
여름 맞이 이벤트 진행중입니다.
시원하게 머리 자르러 오세요!!
최대 30% 할인 중!!!
감사합니다. - BOA 미용실` // 임시 메시지 내용
            }));

            setRecipients(formattedRecipients);
            setTotalPages(1); // 페이지네이션이 필요한 경우 수정

            // 첫 번째 수신자를 기본 선택
            if (formattedRecipients.length > 0 && !selectedRecipient) {
                setSelectedRecipient(formattedRecipients[0]);
            }

        } catch (error) {
            console.error('배치 상세 정보 불러오기 실패:', error);
            setError('배치 상세 정보를 불러오는데 실패했습니다.');
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
                                        <span className={`${styles.typeTag} ${
                                            batchInfo.type === 'GROUP' ? styles.groupType : styles.individualType
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
                                    <span className={styles.statisticsValue}>{batchInfo.totalCount || 0}</span>
                                </div>
                                <div className={styles.statisticsItem}>
                                    <span className={styles.statisticsLabel}>성공 개수</span>
                                    <span className={`${styles.statisticsValue} ${styles.successValue}`}>
                                        {batchInfo.successCount !== null && batchInfo.successCount !== undefined ? batchInfo.successCount : '-'}
                                    </span>
                                </div>
                                <div className={styles.statisticsItem}>
                                    <span className={styles.statisticsLabel}>실패 개수</span>
                                    <span className={`${styles.statisticsValue} ${styles.failureValue}`}>
                                        {batchInfo.failureCount !== null && batchInfo.failureCount !== undefined ? batchInfo.failureCount : '-'}
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
                                            className={`${styles.listRow} ${
                                                selectedRecipient?.no === recipient.no ? styles.selected : ''
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