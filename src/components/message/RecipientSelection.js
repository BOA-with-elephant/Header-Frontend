'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/message/RecipientSelection.module.css';

export default function RecipientSelection({
    selectedRecipients,
    filters,
    onFiltersChange,
    onRecipientsChange,
    onComplete
}) {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 더미 고객 데이터 (실제로는 API에서 가져올 데이터)
    const dummyCustomers = [
        {
            id: 1,
            name: '김민수',
            phone: '010-1234-5678',
            preferredService: '헤어컷',
            grade: 'VIP',
            lastVisit: '2025-01-15',
            age: 28,
            sendable: true
        },
        {
            id: 2,
            name: '박영희',
            phone: '010-2345-6789',
            preferredService: '염색',
            grade: '일반',
            lastVisit: '2025-01-10',
            age: 35,
            sendable: true
        },
        {
            id: 3,
            name: '이철수',
            phone: '010-3456-7890',
            preferredService: '파마',
            grade: 'VIP',
            lastVisit: '2025-01-05',
            age: 42,
            sendable: false
        },
        {
            id: 4,
            name: '정수진',
            phone: '010-4567-8901',
            preferredService: '헤어컷',
            grade: '일반',
            lastVisit: '2024-12-20',
            age: 31,
            sendable: true
        }
    ];

    // 필터 옵션들
    const filterOptions = {
        preferredService: ['전체', '헤어컷', '염색', '파마', '트리트먼트'],
        customerGrade: ['전체', 'VIP', '일반'],
        visitPeriod: ['전체', '1개월 이내', '3개월 이내', '6개월 이내', '1년 이내'],
        ageGroup: ['전체', '20대', '30대', '40대', '50대 이상']
    };

    // 컴포넌트 마운트 시 고객 데이터 로드
    useEffect(() => {
        // 실제로는 API 호출
        setTimeout(() => {
            setCustomers(dummyCustomers);
            setFilteredCustomers(dummyCustomers.filter(c => c.sendable));
            setLoading(false);
        }, 500);
    }, []);

    // 필터 적용
    useEffect(() => {
        let filtered = customers.filter(customer => customer.sendable);

        // 선호 서비스 필터
        if (filters.preferredService && filters.preferredService !== '전체') {
            filtered = filtered.filter(c => c.preferredService === filters.preferredService);
        }

        // 고객 등급 필터
        if (filters.customerGrade && filters.customerGrade !== '전체') {
            filtered = filtered.filter(c => c.grade === filters.customerGrade);
        }

        // 방문 기간 필터
        if (filters.visitPeriod && filters.visitPeriod !== '전체') {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.visitPeriod) {
                case '1개월 이내':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case '3개월 이내':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case '6개월 이내':
                    filterDate.setMonth(now.getMonth() - 6);
                    break;
                case '1년 이내':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filtered = filtered.filter(c => new Date(c.lastVisit) >= filterDate);
        }

        // 연령대 필터
        if (filters.ageGroup && filters.ageGroup !== '전체') {
            const ageRange = filters.ageGroup.replace('대', '').replace(' 이상', '');
            const minAge = parseInt(ageRange);
            const maxAge = filters.ageGroup.includes('이상') ? 100 : minAge + 9;

            filtered = filtered.filter(c => c.age >= minAge && c.age <= maxAge);
        }

        setFilteredCustomers(filtered);
    }, [filters, customers]);

    // 필터 변경 처리
    const handleFilterChange = (filterType, value) => {
        onFiltersChange({
            ...filters,
            [filterType]: value
        });
    };

    // 체크박스 전용 핸들러 
    const handleCheckboxClick = (e, customer) => {
        e.preventDefault();
        e.stopPropagation();
        handleCustomerSelect(customer);
    };

    const handleCardClick = (e, customer) => {
        // 체크박스나 그 부모 요소를 클릭한 경우 무시
        if (e.target.type === 'checkbox' || e.target.closest('.customerCheckbox')) {
            return;
        }
        handleCustomerSelect(customer);
    };

    // 고객 선택/해제
    const handleCustomerSelect = (customer) => {
        const isSelected = selectedRecipients.some(r => r.id === customer.id);
        let newSelection;

        if (isSelected) {
            newSelection = selectedRecipients.filter(r => r.id !== customer.id);
        } else {
            newSelection = [...selectedRecipients, customer];
        }

        onRecipientsChange(newSelection); // 단순히 상태만 업데이트
    };

    const handleComplete = () => {
        if (selectedRecipients.length > 0 && onComplete) {
            onComplete();
        }
    };

    // 전체 선택/해제
    const handleSelectAll = () => {
        if (selectedRecipients.length === filteredCustomers.length) {
            onRecipientsChange([]);
        } else {
            onRecipientsChange([...filteredCustomers]);
        }
    };

    // 필터 초기화
    const resetFilters = () => {
        onFiltersChange({
            preferredService: '',
            customerGrade: '',
            visitPeriod: '',
            ageGroup: ''
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>3. 수신자 선택</h2>
                <p className={styles.description}>
                    메세지를 받을 고객을 선택해주세요
                </p>
            </div>

            {/* 필터 영역 */}
            <div className={styles.filtersSection}>
                <div className={styles.filtersHeader}>
                    <h3 className={styles.filtersTitle}>필터</h3>
                    <button className={styles.resetButton} onClick={resetFilters}>
                        초기화
                    </button>
                </div>

                <div className={styles.filtersGrid}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>선호 서비스</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.preferredService}
                            onChange={(e) => handleFilterChange('preferredService', e.target.value)}
                        >
                            {filterOptions.preferredService.map(option => (
                                <option key={option} value={option === '전체' ? '' : option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>고객 등급</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.customerGrade}
                            onChange={(e) => handleFilterChange('customerGrade', e.target.value)}
                        >
                            {filterOptions.customerGrade.map(option => (
                                <option key={option} value={option === '전체' ? '' : option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>방문 기간</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.visitPeriod}
                            onChange={(e) => handleFilterChange('visitPeriod', e.target.value)}
                        >
                            {filterOptions.visitPeriod.map(option => (
                                <option key={option} value={option === '전체' ? '' : option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>연령대</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.ageGroup}
                            onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                        >
                            {filterOptions.ageGroup.map(option => (
                                <option key={option} value={option === '전체' ? '' : option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 고객 목록 */}
            <div className={styles.customersSection}>
                <div className={styles.customersHeader}>
                    <div className={styles.customersInfo}>
                        <span className={styles.customersCount}>
                            총 {filteredCustomers.length}명
                        </span>
                        <span className={styles.selectedCount}>
                            선택됨: {selectedRecipients.length}명
                        </span>
                    </div>
                    <button
                        className={styles.selectAllButton}
                        onClick={handleSelectAll}
                        disabled={filteredCustomers.length === 0}
                    >
                        {selectedRecipients.length === filteredCustomers.length ? '전체 해제' : '전체 선택'}
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner}></div>
                        <span>고객 목록을 불러오는 중...</span>
                    </div>
                ) : (
                    <div className={styles.customersList}>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => {
                                const isSelected = selectedRecipients.some(r => r.id === customer.id);

                                return (
                                    <div
                                        key={customer.id}
                                        className={`${styles.customerCard} ${isSelected ? styles.selected : ''}`}
                                        onClick={(e) => handleCardClick(e, customer)}
                                    >
                                        <div className={styles.customerCheckbox} onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleCustomerSelect(customer)}
                                            />
                                        </div>

                                        <div className={styles.customerInfo}>
                                            <div className={styles.customerMain}>
                                                <span className={styles.customerName}>
                                                    {customer.name}
                                                    {customer.grade === 'VIP' && (
                                                        <span className={styles.vipBadge}>VIP</span>
                                                    )}
                                                </span>
                                                <span className={styles.customerPhone}>
                                                    {customer.phone}
                                                </span>
                                            </div>

                                            <div className={styles.customerDetails}>
                                                <span className={styles.customerService}>
                                                    선호: {customer.preferredService}
                                                </span>
                                                <span className={styles.customerVisit}>
                                                    최근 방문: {new Date(customer.lastVisit).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>👥</div>
                                <h3 className={styles.emptyTitle}>조건에 맞는 고객이 없습니다</h3>
                                <p className={styles.emptyDescription}>
                                    필터 조건을 변경하거나 초기화해보세요.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.completeSection}>
                <div className={styles.selectedSummary}>
                    <span className={styles.selectedText}>
                        {selectedRecipients.length}명이 선택되었습니다
                    </span>
                </div>
                <button
                    className={styles.completeButton}
                    onClick={handleComplete}
                    disabled={selectedRecipients.length === 0}
                >
                    수신자 선택 완료
                </button>
            </div>
        </div>
    );
}