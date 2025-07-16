'use client';
import { useState, useEffect } from 'react';
import styles from '@/styles/admin/customer/CustomerDetailModal.module.css';

export default function CustomerDetailModal({ 
    isOpen, 
    onClose, 
    customer,
    onSave
}) {
    const [memo, setMemo] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [originalMemo, setOriginalMemo] = useState('');

    // 모달이 열릴 때 고객의 메모 데이터 초기화
    useEffect(() => {
        if (isOpen && customer) {
            const customerMemo = customer.memo || '';
            setMemo(customerMemo);
            setOriginalMemo(customerMemo);
            setIsEditing(false);
        }
    }, [isOpen, customer]);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // 모달 닫기
    const handleClose = () => {
        // 편집 중이면 원본으로 되돌리기
        if (isEditing) {
            setMemo(originalMemo);
            setIsEditing(false);
        }
        onClose();
    };

    // 수정 모드 토글
    const handleEditToggle = () => {
        if (isEditing) {
            // 취소 시 원본으로 되돌리기
            setMemo(originalMemo);
        }
        setIsEditing(!isEditing);
    };

    // 메모 저장
    const handleSave = async () => {
        try {
            // API 요청 시뮬레이션
            const requestBody = {
                customerId: customer.id,
                memo: memo
            };
            
            // 실제로는 여기서 API 호출
            console.log('메모 저장 요청:', requestBody);
            
            // 부모 컴포넌트에 저장 콜백 호출
            if (onSave) {
                await onSave(customer.id, memo);
            }
            
            setOriginalMemo(memo);
            setIsEditing(false);
        } catch (error) {
            console.error('메모 저장 실패:', error);
        }
    };

    // 금액 포맷팅
    const formatCurrency = (amount) => {
        return `₩ ${amount.toLocaleString()}`;
    };

    // 생년월일 포맷팅 (가상 데이터)
    const formatBirthDate = (customer) => {
        // 실제로는 customer.birthDate 사용
        return '1990.03.15';
    };

    if (!isOpen || !customer) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <span className={styles.headerIcon}>👤</span>
                        <span className={styles.headerTitle}>회원 상세 정보</span>
                    </div>
                    <button 
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 바디 */}
                <div className={styles.modalBody}>
                    {/* 기본 정보 섹션 */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>📋</span>
                            <h3 className={styles.sectionTitle}>기본 정보</h3>
                        </div>
                        
                        <div className={styles.customerInfo}>
                            <div className={styles.profileSection}>
                                <div className={styles.profileAvatar}>
                                    <div className={styles.avatarPlaceholder}></div>
                                </div>
                                <div className={styles.profileDetails}>
                                    <div className={styles.nameRow}>
                                        <span className={styles.customerName}>{customer.name}</span>
                                        {customer.isVip && <span className={styles.vipBadge}>VIP</span>}
                                    </div>
                                    <div className={styles.contactInfo}>
                                        <span className={styles.phone}>📞 {customer.phone}</span>
                                        <span className={styles.gender}>남성</span>
                                    </div>
                                    <div className={styles.birthDate}>
                                        🎂 {formatBirthDate(customer)}
                                    </div>
                                    <div className={styles.moreBtn}>···</div>
                                </div>
                            </div>
                            
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>마지막 방문</div>
                                    <div className={styles.statValue}>{customer.lastVisit}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>선호 서비스</div>
                                    <div className={styles.statValue}>{customer.preferredServices.join(', ')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 메모 섹션 */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>📝</span>
                            <h3 className={styles.sectionTitle}>메모</h3>
                        </div>
                        
                        <div className={styles.memoSection}>
                            {isEditing ? (
                                <textarea
                                    className={styles.memoTextarea}
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="고객에 대한 메모를 입력하세요..."
                                    rows={4}
                                    autoFocus
                                />
                            ) : (
                                <div className={styles.memoDisplay}>
                                    {memo || '메모가 없습니다.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className={styles.modalFooter}>
                    {isEditing ? (
                        <>
                            <button 
                                className={styles.cancelBtn}
                                onClick={handleEditToggle}
                            >
                                취소
                            </button>
                            <button 
                                className={styles.saveBtn}
                                onClick={handleSave}
                            >
                                수정
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className={styles.editBtn}
                                onClick={handleEditToggle}
                            >
                                수정
                            </button>
                            <button 
                                className={styles.deleteBtn}
                                onClick={handleClose}
                            >
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}