'use client';
import { useState } from 'react';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import CustomerCard from '@/components/ui/CustomerCard';
import styles from '@/styles/admin/customer/Customer.module.css';

export default function Customer() {
    const { modal, closeModal, showError, showSuccess, showConfirm, showWarning } = useMessageModal();
    
    // 고객 데이터 (실제로는 API에서 가져올 데이터)
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: '이지훈',
            phone: '010-2345-6789',
            isVip: true,
            lastVisit: '1일전',
            visitCount: 52,
            totalAmount: 3150000,
            preferredServices: ['헤어컷', '파마']
        },
        {
            id: 2,
            name: '박서연',
            phone: '010-3456-7890',
            isVip: true,
            lastVisit: '2일전',
            visitCount: 28,
            totalAmount: 1890000,
            preferredServices: ['염색', '트리트먼트']
        },
        {
            id: 3,
            name: '최민정',
            phone: '010-4567-8901',
            isVip: false,
            lastVisit: '3일전',
            visitCount: 15,
            totalAmount: 580000,
            preferredServices: ['헤어컷']
        },
        {
            id: 4,
            name: '김동현',
            phone: '010-5678-9012',
            isVip: true,
            lastVisit: '1주전',
            visitCount: 73,
            totalAmount: 4520000,
            preferredServices: ['헤어컷', '염색', '파마']
        },
        {
            id: 5,
            name: '홍유진',
            phone: '010-6789-0123',
            isVip: false,
            lastVisit: '5일전',
            visitCount: 8,
            totalAmount: 320000,
            preferredServices: ['헤어컷', '염색']
        },
        {
            id: 6,
            name: '윤상우',
            phone: '010-7890-1234',
            isVip: true,
            lastVisit: '2일전',
            visitCount: 39,
            totalAmount: 2100000,
            preferredServices: ['헤어컷', '펌']
        },
        {
            id: 7,
            name: '정하영',
            phone: '010-8901-2345',
            isVip: false,
            lastVisit: '1주전',
            visitCount: 12,
            totalAmount: 450000,
            preferredServices: ['트리트먼트']
        },
        {
            id: 8,
            name: '강민석',
            phone: '010-9012-3456',
            isVip: true,
            lastVisit: '4일전',
            visitCount: 65,
            totalAmount: 3890000,
            preferredServices: ['헤어컷', '염색']
        },
        {
            id: 9,
            name: '조예은',
            phone: '010-1357-2468',
            isVip: false,
            lastVisit: '6일전',
            visitCount: 5,
            totalAmount: 180000,
            preferredServices: ['헤어컷']
        },
        {
            id: 10,
            name: '신재훈',
            phone: '010-2468-1357',
            isVip: true,
            lastVisit: '3일전',
            visitCount: 45,
            totalAmount: 2750000,
            preferredServices: ['헤어컷', '파마', '염색']
        },
        {
            id: 11,
            name: '문소영',
            phone: '010-3579-4681',
            isVip: false,
            lastVisit: '1주전',
            visitCount: 22,
            totalAmount: 890000,
            preferredServices: ['염색', '트리트먼트']
        },
        {
            id: 12,
            name: '배준호',
            phone: '010-4681-3579',
            isVip: true,
            lastVisit: '1일전',
            visitCount: 88,
            totalAmount: 5240000,
            preferredServices: ['헤어컷', '펌']
        },
        {
            id: 13,
            name: '한수빈',
            phone: '010-5792-6803',
            isVip: false,
            lastVisit: '4일전',
            visitCount: 18,
            totalAmount: 720000,
            preferredServices: ['헤어컷', '염색']
        },
        {
            id: 14,
            name: '노태영',
            phone: '010-6803-5792',
            isVip: true,
            lastVisit: '2일전',
            visitCount: 56,
            totalAmount: 3460000,
            preferredServices: ['헤어컷', '파마', '트리트먼트']
        },
        {
            id: 15,
            name: '임채윤',
            phone: '010-7914-8025',
            isVip: false,
            lastVisit: '5일전',
            visitCount: 11,
            totalAmount: 420000,
            preferredServices: ['트리트먼트']
        },
        {
            id: 16,
            name: '송민호',
            phone: '010-8025-7914',
            isVip: true,
            lastVisit: '1일전',
            visitCount: 62,
            totalAmount: 3780000,
            preferredServices: ['헤어컷', '염색']
        },
        {
            id: 17,
            name: '유다빈',
            phone: '010-9136-2470',
            isVip: false,
            lastVisit: '6일전',
            visitCount: 7,
            totalAmount: 285000,
            preferredServices: ['헤어컷']
        },
        {
            id: 18,
            name: '김은서',
            phone: '010-1470-9136',
            isVip: true,
            lastVisit: '3일전',
            visitCount: 41,
            totalAmount: 2320000,
            preferredServices: ['염색', '파마', '트리트먼트']
        }
    ]);

    // 필터 및 정렬 상태
    const [filters, setFilters] = useState({
        search: '',
        memberType: '전체회원',
        sortBy: '방문일 순'
    });

    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
                // 방문일 순 정렬 (최근 방문 순)
                const visitOrder = { '1일전': 1, '2일전': 2, '3일전': 3, '4일전': 4, '5일전': 5, '1주전': 7 };
                filtered.sort((a, b) => (visitOrder[a.lastVisit] || 999) - (visitOrder[b.lastVisit] || 999));
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
        // 검색할 때 첫 페이지로 리셋
        setCurrentPage(1);
    };

    // 필터 처리
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        // 필터 변경 시 첫 페이지로 리셋
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

    // 신규 고객 추가
    const handleAddCustomer = () => {
        showConfirm(
            '신규 고객 등록',
            '신규 고객 정보를 입력하시겠습니까?',
            () => {
                // 실제로는 고객 등록 모달을 열거나 페이지로 이동
                showSuccess('등록 완료', '신규 고객이 성공적으로 등록되었습니다.');
            }
        );
    };

    // 고객 액션 처리
    const handleCustomerAction = (customerId, action) => {
        const customer = customers.find(c => c.id === customerId);
        
        switch (action) {
            case 'reservation':
                showSuccess('예약 완료', `${customer.name}님의 예약이 완료되었습니다.`);
                break;
            case 'history':
                showSuccess('히스토리', `${customer.name}님의 방문 기록을 확인합니다.`);
                break;
            case 'message':
                showSuccess('메세지 발송', `${customer.name}님에게 메세지를 발송했습니다.`);
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

                {/* 고객 카드 그리드 */}
                <div className={styles.customerGrid}>
                    {currentCustomers.length > 0 ? (
                        currentCustomers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onAction={handleCustomerAction}
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
            </div>

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