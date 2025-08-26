'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCustomers } from '@/hooks/useCustomers'; // 기존 useCustomers 훅 사용
import styles from '@/styles/admin/message/RecipientSelection.module.css';

export default function RecipientSelection({ 
    userInfo,
    selectedRecipients, 
    filters, 
    onFiltersChange, 
    onRecipientsChange,
    onComplete
}) {
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    
    // shop_id를 context나 store에서 가져오도록 수정
    const SHOP_ID = userInfo?.shopCode || 1;

    // useCustomers 훅 사용
    const { customers, loading, error } = useCustomers(SHOP_ID);

    // useCustomers 데이터를 RecipientSelection에서 사용하는 형태로 변환
    const transformCustomersForRecipient = (customers) => {
        return customers.map(customer => {
            // 생년월일로 나이 계산
            const calculateAge = (birthday) => {
                if (!birthday) return 0;
                const birth = new Date(birthday);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };

            return {
                id: customer.clientCode,
                clientCode: customer.clientCode,
                name: customer.name,
                phone: customer.phone || '',
                birthday: customer.birthday || '',
                memo: customer.memo || '',
                sendable: customer.sendable || false,
                visitCount: customer.visitCount || 0,
                totalAmount: customer.totalAmount || 0,
                lastVisit: customer.lastVisit || '', // useCustomers에서 이미 변환된 데이터 사용
                preferredService: customer.preferredServices?.[0] || '없음', // 배열의 첫 번째 요소 사용
                grade: customer.isVip ? 'VIP' : '일반', // isVip 필드 사용
                age: calculateAge(customer.birthday)
            };
        });
    };

    // 변환된 고객 데이터 (useMemo로 메모이제이션)
    const transformedCustomers = useMemo(() => {
        return transformCustomersForRecipient(customers);
    }, [customers]);

    // 필터 옵션들 (동적으로 생성) - useMemo로 메모이제이션
    const filterOptions = useMemo(() => {
        const uniqueServices = [...new Set(transformedCustomers.map(c => c.preferredService).filter(s => s && s !== '없음'))];
        const uniqueGrades = [...new Set(transformedCustomers.map(c => c.grade))];
        
        return {
            preferredService: ['전체', ...uniqueServices],
            customerGrade: ['전체', ...uniqueGrades],
            ageGroup: ['전체', '20대', '30대', '40대', '50대 이상']
        };
    }, [transformedCustomers]);

    // 필터 적용
    useEffect(() => {
        let filtered = transformedCustomers.filter(customer => customer.sendable);

        // 선호 서비스 필터
        if (filters.preferredService && filters.preferredService !== '전체') {
            filtered = filtered.filter(c => c.preferredService === filters.preferredService);
        }

        // 고객 등급 필터
        if (filters.customerGrade && filters.customerGrade !== '전체') {
            filtered = filtered.filter(c => c.grade === filters.customerGrade);
        }

        // 연령대 필터
        if (filters.ageGroup && filters.ageGroup !== '전체') {
            const ageRange = filters.ageGroup.replace('대', '').replace(' 이상', '');
            const minAge = parseInt(ageRange);
            const maxAge = filters.ageGroup.includes('이상') ? 100 : minAge + 9;
            
            filtered = filtered.filter(c => c.age >= minAge && c.age <= maxAge);
        }

        setFilteredCustomers(filtered);
    }, [filters, transformedCustomers]);

    // 필터 변경 처리
    const handleFilterChange = (filterType, value) => {
        onFiltersChange({
            ...filters,
            [filterType]: value
        });
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
        
        onRecipientsChange(newSelection);
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
            ageGroup: ''
        });
    };

    // 에러 처리
    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>3. 수신자 선택</h2>
                    <p className={styles.description}>고객 목록을 불러오는데 실패했습니다.</p>
                </div>
                <div className={styles.errorMessage}>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

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
                    <button 
                        className={styles.resetButton} 
                        onClick={resetFilters}
                        disabled={loading}
                    >
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
                            disabled={loading}
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
                            disabled={loading}
                        >
                            {filterOptions.customerGrade.map(option => (
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
                            disabled={loading}
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
                        disabled={filteredCustomers.length === 0 || loading}
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
                                        onClick={() => handleCustomerSelect(customer)}
                                    >
                                        <div className={styles.customerCheckbox}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleCustomerSelect(customer)}
                                                onClick={(e) => e.stopPropagation()}
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
                                                    최근 방문: {customer.lastVisit || '방문 기록 없음' }
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

            {/* 수신자 선택 완료 섹션 */}
            <div className={styles.completeSection}>
                <div className={styles.selectedSummary}>
                    <span className={styles.selectedText}>
                        {selectedRecipients.length}명이 선택되었습니다
                    </span>
                </div>
                <button
                    className={styles.completeButton}
                    onClick={handleComplete}
                    disabled={selectedRecipients.length === 0 || loading}
                >
                    수신자 선택 완료
                </button>
            </div>
        </div>
    );
}