'use client';
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { MessagesAPI, CustomersAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useMessageModal } from '@/hooks/useMessageModal';
import MessageModal from '@/components/ui/MessageModal';
import CustomerCard from '@/components/ui/CustomerCard';
import CustomerRegisterModal from '@/components/ui/CustomerRegisterModal';
import CustomerDetailModal from '@/components/ui/CustomerDetailModal';
import CustomerHistoryModal from '@/components/ui/CustomerHistoryModal';
import MessageSlideModal from '@/components/message/MessageSlideModal';
import NewReservationModal from '../reservation/components/NewReservationModal'; // 예약 모달 추가
import styles from '@/styles/admin/customer/Customer.module.css';

export default function Customer() {
    const { modal, closeModal, showError, showSuccess, showConfirm } = useMessageModal();
    
    // TODO: shop_id를 context나 store에서 가져오도록 수정
    const SHOP_ID = 1;

    // 고객 관리 훅 (목록, 추가, 삭제, 메모 수정)
    const {
        customers,
        loading: customersLoading,
        error: customersError,
        addCustomer,
        deleteCustomer,
        updateMemo,
        refetch: refetchCustomers
    } = useCustomers(SHOP_ID);

    // 기타 API 호출용 훅 (히스토리 조회, 메시지 발송 등)
    const { execute: executeApi, loading: apiLoading } = useApi();

    // 메세지 전송 모달 상태
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        recipientSelection: null
    });

    // 예약 등록 모달 상태 추가
    const [reservationModal, setReservationModal] = useState({
        isOpen: false,
        selectedCustomer: null,
        selectedDate: new Date().toISOString().split('T')[0] // 오늘 날짜를 기본값으로
    });

    // 히스토리 모달 상태
    const [historyModal, setHistoryModal] = useState({
        isOpen: false,
        title: '',
        historyData: []
    });

    // 신규 고객 등록 모달 상태
    const [registerModal, setRegisterModal] = useState({
        isOpen: false
    });

    // 고객 상세 모달 상태
    const [detailModal, setDetailModal] = useState({
        isOpen: false,
        customer: null
    });

    // 필터 및 정렬 상태
    const [filters, setFilters] = useState({
        search: '',
        memberType: '전체회원',
        sortBy: '방문일 순'
    });

    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // 예약 가능 시간 데이터 상태 (NewReservationModal에서 필요)
    const [resvDateList, setResvDateList] = useState([]);

    // 예약 가능 시간 데이터 fetch 함수
    const fetchReservationSchedule = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/shops/reservation/${SHOP_ID}/available-schedule`);
            const data = await response.json();
            setResvDateList(data);
            console.log('예약 가능 시간 데이터:', data);
        } catch (error) {
            console.error('예약 가능 시간 조회 실패:', error);
            showError('오류', '예약 가능 시간을 불러오는데 실패했습니다.');
        }
    };

    // 예약 데이터 fetch 함수 (NewReservationModal에서 필요)
    const fetchReservationData = async () => {
        // 예약 데이터 갱신 로직 (필요시 구현)
        console.log('예약 데이터 갱신');
    };

    // 고객 히스토리 조회 (새로운 API 패턴 사용)
    const fetchCustomerHistory = async (clientCode) => {
        try {
            const response = await executeApi(CustomersAPI.getCustomer, SHOP_ID, clientCode);
            
            // API 응답 데이터를 모달에서 사용하는 형태로 변환
            return response.data.map(item => ({
                date: item.visitDate,
                services: item.menuName
            }));
        } catch (error) {
            console.error('히스토리 조회 실패:', error);
            throw error;
        }
    };

    // 예약 등록 모달 열기
    const openReservationModal = async (customer) => {
        try {
            // 예약 가능 시간 데이터를 먼저 가져오기
            await fetchReservationSchedule();
            
            setReservationModal({
                isOpen: true,
                selectedCustomer: customer,
                selectedDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            showError('오류', '예약 모달을 여는데 실패했습니다.');
        }
    };

    // 예약 등록 모달 닫기
    const closeReservationModal = () => {
        setReservationModal({
            isOpen: false,
            selectedCustomer: null,
            selectedDate: new Date().toISOString().split('T')[0]
        });
    };

    // 메세지 모달 열기
    const openMessageModal = (recipientSelection) => {
        setMessageModal({ isOpen: true, recipientSelection });
    };

     // 메세지 모달 닫기
    const closeMessageModal = () => {
        setMessageModal({ isOpen: false, recipientSelection: null });
    };

    // 히스토리 모달 열기
    const openHistoryModal = async (customer) => {
        try {
            const historyData = await fetchCustomerHistory(customer.clientCode);

            setHistoryModal({
                isOpen: true,
                title: `${customer.name}님 방문 히스토리`,
                historyData: historyData
            });
        } catch (error) {
            showError('오류', '히스토리를 불러오는데 실패했습니다.');
        }
    };

    // 히스토리 모달 닫기
    const closeHistoryModal = () => {
        setHistoryModal({
            isOpen: false,
            title: '',
            historyData: []
        });
    };

    // 필터링된 고객 목록
    const getFilteredCustomers = () => {
        let filtered = [...customers];

        // 검색 필터 (이름 또는 전화번호)
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(customer =>
                customer.name?.toLowerCase().includes(searchTerm) ||
                customer.phone?.replace(/-/g, '').includes(searchTerm.replace(/-/g, ''))
            );
        }

        // 회원 유형 필터
        if (filters.memberType === 'VIP회원') {
            filtered = filtered.filter(customer => customer.isVip);
        } else if (filters.memberType === '일반회원') {
            filtered = filtered.filter(customer => !customer.isVip);
        }

        // 정렬
        switch (filters.sortBy) {
            case '가나다 순':
                filtered.sort((a, b) => a.name?.localeCompare(b.name) || 0);
                break;
            case '결제금액 순':
                filtered.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
                break;
            case '방문일 순':
            default:
                filtered.sort((a, b) => {
                    const aVisits = a.visitCount || 0;
                    const bVisits = b.visitCount || 0;
                    
                    if (aVisits === 0 && bVisits === 0) return 0;
                    if (aVisits === 0) return 1;
                    if (bVisits === 0) return -1;
                    return bVisits - aVisits;
                });
                break;
        }

        return filtered;
    };

    const filteredCustomers = getFilteredCustomers();

    // 검색 처리
    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setFilters(prev => ({
            ...prev,
            search: searchValue
        }));
        setCurrentPage(1);
    };

    // 필터 처리
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setCurrentPage(1);
    };

    // 필터 초기화
    const resetFilters = () => {
        setFilters({
            search: '',
            memberType: '전체회원',
            sortBy: '방문일 순'
        });
        setCurrentPage(1);
    };

    // 고객 상세 모달 열기
    const openDetailModal = (customer) => {
        setDetailModal({
            isOpen: true,
            customer: customer
        });
    };

    // 고객 상세 모달 닫기
    const closeDetailModal = () => {
        setDetailModal({
            isOpen: false,
            customer: null
        });
    };

    // 고객 메모 저장 (useCustomers 훅의 updateMemo 사용)
    const handleMemoSave = async (clientCode, memo) => {
        try {
            await updateMemo(clientCode, memo);
            showSuccess('저장 완료', '메모가 성공적으로 저장되었습니다.');
        } catch (error) {
            showError('저장 실패', '메모 저장 중 오류가 발생했습니다.');
        }
    };

    // 신규 고객 등록 처리
    const handleAddCustomer = () => {
        setRegisterModal({ isOpen: true });
    };

    // 신규 고객 등록 확인 (useCustomers 훅의 addCustomer 사용)
    const handleCustomerRegister = async (customerData) => {
        try {
            await addCustomer({
                name: customerData.name,
                birthday: customerData.birthday,
                phone: customerData.phone,
                sendable: customerData.allowsMarketing,
                memo: customerData.memo
            });

            setRegisterModal({ isOpen: false });
            showSuccess('등록 완료', '신규 고객이 성공적으로 등록되었습니다.');
        } catch (error) {
            showError('등록 실패', '고객 등록 중 오류가 발생했습니다.');
        }
    };

    // 신규 고객 등록 모달 닫기
    const handleRegisterModalClose = () => {
        setRegisterModal({ isOpen: false });
    };

    // 고객 삭제 처리 (useCustomers 훅의 deleteCustomer 사용)
    const handleDeleteCustomer = async (clientCode) => {
        const customer = customers.find(c => c.clientCode === clientCode);

        showConfirm(
            '고객 삭제',
            `${customer?.name}님을 정말 삭제하시겠습니까?\n삭제된 고객 정보는 복구할 수 없습니다.`,
            async () => {
                try {
                    await deleteCustomer(clientCode);
                    showSuccess('삭제 완료', '고객이 성공적으로 삭제되었습니다.');
                } catch (error) {
                    showError('삭제 실패', '고객 삭제 중 오류가 발생했습니다.');
                }
            }
        );
    };

    // 메시지 발송 처리 (새로운 API 패턴 사용)
    const handleSendMessage = async (messageData) => {
        try {
            await executeApi(MessagesAPI.sendMessage, SHOP_ID, messageData);
            showSuccess('발송 완료', '메시지가 성공적으로 발송되었습니다.');
        } catch (error) {
            showError('발송 실패', '메시지 발송 중 오류가 발생했습니다.');
        }
    };

    // 고객 액션 처리 (예약 등록 액션 추가)
    const handleCustomerAction = (clientCode, action, event) => {
        // 이벤트 전파 방지
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        const customer = customers.find(c => c.clientCode === clientCode);

        switch (action) {
            case 'detail':
                openDetailModal(customer);
                break;
            case 'reservation':
                // 예약 등록 모달 열기 (기존 success 메시지 대신)
                openReservationModal(customer);
                break;
            case 'history':
                openHistoryModal(customer);
                break;
            case 'message':
                openMessageModal(customer);
                break;
            case 'delete':
                handleDeleteCustomer(clientCode);
                break;
            default:
                break;
        }
    };

    // 페이지네이션 처리
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    // 페이지 변경
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // 로딩 상태 (훅의 로딩 상태 사용)
    const isLoading = customersLoading || apiLoading;

    // 에러 처리
    if (customersError) {
        return (
            <div className={styles.errorContainer}>
                <h1>고객관리</h1>
                <div className={styles.errorMessage}>
                    <p>고객 목록을 불러오는데 실패했습니다.</p>
                    <p>{customersError}</p>
                    <button onClick={refetchCustomers} className={styles.retryBtn}>
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <h1>고객관리</h1>

            <div className={styles.contentCard}>
                {/* 검색 및 필터 영역 */}
                <div className={styles.customerHeader}>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchInputWrapper}>
                            <input
                                type="text"
                                placeholder="고객명, 전화번호로 검색..."
                                value={filters.search}
                                onChange={handleSearch}
                                className={styles.searchInput}
                                disabled={isLoading}
                            />
                            <span className={styles.searchIcon}>🔍</span>
                        </div>
                    </div>

                    <div className={styles.filterControls}>
                        <select
                            value={filters.memberType}
                            onChange={(e) => handleFilterChange('memberType', e.target.value)}
                            className={styles.filterSelect}
                            disabled={isLoading}
                        >
                            <option>전체회원</option>
                            <option>VIP회원</option>
                            <option>일반회원</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className={styles.filterSelect}
                            disabled={isLoading}
                        >
                            <option>방문일 순</option>
                            <option>가나다 순</option>
                            <option>결제금액 순</option>
                        </select>

                        <button
                            className={styles.resetFilterBtn}
                            onClick={resetFilters}
                            disabled={isLoading}
                        >
                            필터 초기화
                        </button>

                        <button
                            className={styles.addCustomerBtn}
                            onClick={handleAddCustomer}
                            disabled={isLoading}
                        >
                            + 신규 고객
                        </button>
                    </div>
                </div>

                {/* 검색 결과 정보 */}
                {filters.search && (
                    <div className={styles.searchInfo}>
                        <span className={styles.searchTerm}>"{filters.search}"</span>에 대한 검색 결과
                        <span className={styles.resultCount}>{filteredCustomers.length}명</span>
                    </div>
                )}

                {/* 로딩 상태 */}
                {isLoading ? (
                    <div className="content-card">
                        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
                            <div>고객 데이터를 불러오는 중...</div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 고객 카드 그리드 */}
                        <div className={styles.customerGrid}>
                            {currentCustomers.length > 0 ? (
                                currentCustomers.map((customer) => (
                                    <CustomerCard
                                        key={customer.clientCode}
                                        customer={customer}
                                        onAction={handleCustomerAction}
                                        onClick={() => openDetailModal(customer)}
                                    />
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <div className={styles.noResultsIcon}>🔍</div>
                                    <h3 className={styles.noResultsTitle}>검색 결과가 없습니다</h3>
                                    <p className={styles.noResultsText}>
                                        다른 검색어를 입력하거나 필터를 변경해보세요.
                                    </p>
                                    <button
                                        className={styles.resetBtn}
                                        onClick={resetFilters}
                                    >
                                        필터 초기화
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.paginationBtn}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ‹
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`${styles.paginationBtn} ${currentPage === page ? styles.active : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className={styles.paginationBtn}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 예약 등록 모달 추가 */}
            {reservationModal.isOpen && (
                <NewReservationModal
                    isShowNewResvModal={reservationModal.isOpen}
                    setIsShowNewResvModal={closeReservationModal}
                    selectedDate={reservationModal.selectedDate}
                    resvDateList={resvDateList}
                    fetchReservationData={fetchReservationData}
                    setIsShowMessageModal={(show) => {
                        if (show) {
                            showSuccess('예약 등록 완료', '예약이 성공적으로 등록되었습니다.');
                        }
                    }}
                    setResultTitle={() => {}}
                    setResultMessage={() => {}}
                    setResultType={() => {}}
                    setMessageContext={() => {}}
                    // 선택된 고객 정보를 모달에 전달하기 위한 props 추가
                    prefilledCustomer={reservationModal.selectedCustomer}
                />
            )}

            {/* 메세지 전송 모달 */}
            <MessageSlideModal
                isOpen={messageModal.isOpen}
                onClose={closeMessageModal}
                recipientSelection={messageModal.recipientSelection} 
            />

            {/* 신규 고객 등록 모달 */}
            <CustomerRegisterModal
                isOpen={registerModal.isOpen}
                onClose={handleRegisterModalClose}
                onConfirm={handleCustomerRegister}
            />

            {/* 고객 상세 모달 */}
            <CustomerDetailModal
                isOpen={detailModal.isOpen}
                onClose={closeDetailModal}
                customer={detailModal.customer}
                onSave={handleMemoSave}
            />

            {/* 히스토리 모달 */}
            <CustomerHistoryModal
                isOpen={historyModal.isOpen}
                onClose={closeHistoryModal}
                title={historyModal.title}
                historyData={historyModal.historyData}
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
            />
        </>
    );
}