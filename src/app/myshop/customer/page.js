'use client';
import { useState, useEffect } from 'react';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import CustomerCard from '@/components/ui/CustomerCard';
import CustomerRegisterModal from '@/components/ui/CustomerRegisterModal';
import CustomerDetailModal from '@/components/ui/CustomerDetailModal';
import CustomerHistoryModal from '@/components/ui/CustomerHistoryModal';
import MessageSlideModal from '@/components/message/MessageSlideModal';
import NewReservationModal from '@/app/myshop/reservation/components/NewReservationModal';
import ResultCustomMessageModal from '../reservation/components/ResultCustomMessageModal';
import styles from '@/styles/admin/customer/Customer.module.css';

export default function Customer() {
    const { modal, closeModal, showError, showSuccess, showConfirm, showWarning } = useMessageModal();

    // 메세지 전송 모달 상태
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        recipientSelection: null
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

    // ======= 예약 관련 상태 추가 =======
    // 예약 등록 모달 상태
    const [reservationModal, setReservationModal] = useState({
        isOpen: false,
        selectedCustomer: null,
        selectedDate: new Date().toISOString().split('T')[0] // 기본값: 오늘 날짜
    });

    // 예약 결과 메시지 모달 상태
    const [reservationResultModal, setReservationResultModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // 예약 가능 시간 데이터
    const [resvDateList, setResvDateList] = useState([]);

    // 고객 데이터 상태
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 필터 및 정렬 상태
    const [filters, setFilters] = useState({
        search: '',
        memberType: '전체회원',
        sortBy: '방문일 순'
    });

    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // TODO: shop_id를 어디서 가져올지 결정되면 수정
    const SHOP_ID = 1; // 임시값

    // API 데이터를 내부 형식으로 변환
    const transformApiData = (apiData) => {
        return apiData.map(customer => ({
            id: customer.clientCode,
            clientCode: customer.clientCode,
            name: customer.userName,
            phone: customer.phone,
            birthday: customer.birthday,
            sendable: customer.sendable,
            isVip: customer.memo?.includes('VIP') || false, // 메모에 VIP가 있으면 VIP로 표시
            lastVisit: customer.lastVisited === '방문 기록 없음' ? '방문 기록 없음' : customer.lastVisited,
            visitCount: customer.visitCount,
            totalAmount: customer.totalPaymentAmount,
            preferredServices: customer.favoriteMenuName ? [customer.favoriteMenuName] : [],
            memo: customer.memo || ''
        }));
    };

    // 고객 목록 API 호출
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_ID}/customers`);

            if (!response.ok) {
                throw new Error('고객 목록 조회에 실패했습니다.');
            }

            const result = await response.json();

            if (result.success) {
                const transformedData = transformApiData(result.data);
                setCustomers(transformedData);
            } else {
                throw new Error(result.message || '고객 목록 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('고객 목록 조회 오류:', error);
            showError('오류', '고객 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // ======= 예약 관련 API 호출 함수 추가 =======
    // 예약 가능 시간 데이터 조회
    const fetchReservationData = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/shops/reservation/${SHOP_ID}/available-schedule`);
            if (!response.ok) {
                throw new Error('예약 가능 시간 조회에 실패했습니다.');
            }
            const data = await response.json();
            setResvDateList(data);
        } catch (error) {
            console.error('예약 가능 시간 조회 실패:', error);
            showError('오류', '예약 가능 시간을 불러오는데 실패했습니다.');
        }
    };

    // 컴포넌트 마운트 시 고객 목록 및 예약 데이터 조회
    useEffect(() => {
        fetchCustomers();
        fetchReservationData(); // 예약 데이터도 함께 조회
    }, []);

    // 고객 메모 수정 API 호출
    const updateCustomerMemo = async (clientCode, memo) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/my-shops/${SHOP_ID}/customers/${clientCode}?memo=${encodeURIComponent(memo)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('메모 수정에 실패했습니다.');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || '메모 수정에 실패했습니다.');
            }

            return result.data;
        } catch (error) {
            console.error('메모 수정 오류:', error);
            throw error;
        }
    };

    // 신규 고객 추가 API 호출
    const addCustomer = async (customerData) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_ID}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: customerData.name,
                    birthday: customerData.birthday,
                    phone: customerData.phone,
                    sendable: customerData.allowsMarketing,
                    memo: customerData.memo
                })
            });

            if (!response.ok) {
                throw new Error('고객 등록에 실패했습니다.');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || '고객 등록에 실패했습니다.');
            }

            return result.data;
        } catch (error) {
            console.error('고객 등록 오류:', error);
            throw error;
        }
    };

    // 고객 삭제 API 호출
    const deleteCustomer = async (clientCode) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/my-shops/${SHOP_ID}/customers/${clientCode}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('고객 삭제에 실패했습니다.');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || '고객 삭제에 실패했습니다.');
            }

            return result.data;
        } catch (error) {
            console.error('고객 삭제 오류:', error);
            throw error;
        }
    };

    // 고객 히스토리 API 호출 함수
    const fetchCustomerHistory = async (clientCode) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_ID}/customers/${clientCode}`);

            if (!response.ok) {
                throw new Error('히스토리 조회에 실패했습니다.');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || '히스토리 조회에 실패했습니다.');
            }

            // API 응답 데이터를 모달에서 사용하는 형태로 변환
            return result.data.map(item => ({
                date: item.visitDate,
                services: item.menuName  // 단일 메뉴명으로 처리
            }));

        } catch (error) {
            console.error('히스토리 조회 실패:', error);
            throw error;
        }
    };

    // ======= 예약 관련 모달 핸들러 추가 =======
    // 예약 등록 모달 열기
    const openReservationModal = (customer) => {
        const today = new Date().toISOString().split('T')[0];
        setReservationModal({
            isOpen: true,
            selectedCustomer: customer,
            selectedDate: today // 기본값으로 오늘 날짜 설정
        });
    };

    // 예약 등록 모달 닫기
    const closeReservationModal = () => {
        setReservationModal({
            isOpen: false,
            selectedCustomer: null,
            selectedDate: new Date().toISOString().split('T')[0]
        });
    };

    // 예약 결과 메시지 모달 열기
    const showReservationResult = (title, message, type = 'success') => {
        setReservationResultModal({
            isOpen: true,
            title,
            message,
            type
        });
    };

    // 예약 결과 메시지 모달 닫기
    const closeReservationResultModal = () => {
        setReservationResultModal({
            isOpen: false,
            title: '',
            message: '',
            type: 'success'
        });
    };

    // 메세지 모달 열기
    const openMessageModal = (recipientSelection) => {
        setMessageModal({ isOpen: true, recipientSelection: recipientSelection });
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
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.phone.replace(/-/g, '').includes(searchTerm.replace(/-/g, ''))
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
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case '결제금액 순':
                filtered.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case '방문일 순':
            default:
                // 방문 횟수가 0이면 맨 뒤로, 아니면 마지막 방문일 기준
                filtered.sort((a, b) => {
                    if (a.visitCount === 0 && b.visitCount === 0) return 0;
                    if (a.visitCount === 0) return 1;
                    if (b.visitCount === 0) return -1;
                    return b.visitCount - a.visitCount; // 방문 횟수 많은 순
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

    // 고객 메모 저장
    const handleMemoSave = async (clientCode, memo) => {
        try {
            await updateCustomerMemo(clientCode, memo);

            // 로컬 상태 업데이트
            setCustomers(prev => prev.map(customer =>
                customer.clientCode === clientCode
                    ? {
                        ...customer,
                        memo,
                        isVip: memo.includes('VIP') // 메모에 VIP가 포함되면 VIP 상태 업데이트
                    }
                    : customer
            ));

            showSuccess('저장 완료', '메모가 성공적으로 저장되었습니다.');
        } catch (error) {
            showError('저장 실패', '메모 저장 중 오류가 발생했습니다.');
        }
    };

    // 신규 고객 등록 처리
    const handleAddCustomer = () => {
        setRegisterModal({ isOpen: true });
    };

    // 신규 고객 등록 확인
    const handleCustomerRegister = async (customerData) => {
        try {
            await addCustomer(customerData);

            // 고객 목록 새로고침
            await fetchCustomers();

            // 모달 닫기
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

    // 고객 삭제 처리
    const handleDeleteCustomer = async (clientCode) => {
        const customer = customers.find(c => c.clientCode === clientCode);

        showConfirm(
            '고객 삭제',
            `${customer.name}님을 정말 삭제하시겠습니까?\n삭제된 고객 정보는 복구할 수 없습니다.`,
            async () => {
                try {
                    await deleteCustomer(clientCode);

                    // 로컬 상태에서 삭제
                    setCustomers(prev => prev.filter(c => c.clientCode !== clientCode));

                    showSuccess('삭제 완료', '고객이 성공적으로 삭제되었습니다.');
                } catch (error) {
                    showError('삭제 실패', '고객 삭제 중 오류가 발생했습니다.');
                }
            }
        );
    };

    // 고객 액션 처리 (이벤트 전파 방지 포함)
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
                // ======= 예약 액션 수정 =======
                openReservationModal(customer); // 실제 예약 모달 열기로 변경
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

    // 금액 포맷팅
    const formatCurrency = (amount) => {
        return `₩ ${amount.toLocaleString()}`;
    };

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
                            />
                            <span className={styles.searchIcon}>🔍</span>
                        </div>
                    </div>

                    <div className={styles.filterControls}>
                        <select
                            value={filters.memberType}
                            onChange={(e) => handleFilterChange('memberType', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option>전체회원</option>
                            <option>VIP회원</option>
                            <option>일반회원</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option>방문일 순</option>
                            <option>가나다 순</option>
                            <option>결제금액 순</option>
                        </select>

                        <button
                            className={styles.resetFilterBtn}
                            onClick={resetFilters}
                        >
                            필터 초기화
                        </button>

                        <button
                            className={styles.addCustomerBtn}
                            onClick={handleAddCustomer}
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
                {loading ? (
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

            {/* ======= 예약 관련 모달 추가 ======= */}
            {/* 예약 등록 모달 */}
            {reservationModal.isOpen && reservationModal.selectedCustomer && (
                <NewReservationModal
                    isShowNewResvModal={reservationModal.isOpen}
                    setIsShowNewResvModal={closeReservationModal}
                    selectedDate={reservationModal.selectedDate}
                    selectedCustomer={reservationModal.selectedCustomer} // 선택된 고객 정보 전달
                    resvDateList={resvDateList}
                    fetchReservationData={fetchReservationData}
                    setIsShowMessageModal={(isOpen) => {
                        if (!isOpen) {
                            closeReservationResultModal();
                        }
                    }}
                    setResultTitle={(title) => setReservationResultModal(prev => ({ ...prev, title }))}
                    setResultMessage={(message) => setReservationResultModal(prev => ({ ...prev, message }))}
                    setResultType={(type) => setReservationResultModal(prev => ({ ...prev, type }))}
                    setMessageContext={() => {}} // 필요에 따라 구현
                />
            )}

            {/* 예약 결과 메시지 모달 */}
            <ResultCustomMessageModal
                isShowMessageModal={reservationResultModal.isOpen}
                setIsShowMessageModal={closeReservationResultModal}
                resultMessage={reservationResultModal.message}
                resultTitle={reservationResultModal.title}
                resultType={reservationResultModal.type}
                messageContext="customer-reservation"
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