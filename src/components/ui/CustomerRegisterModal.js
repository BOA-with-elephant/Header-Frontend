'use client';

import { useState } from 'react';
import styles from '@/styles/common/MessageModal.module.css';

export default function CustomerRegisterModal({ 
    isOpen, 
    onClose, 
    onConfirm
}) {
    // 고객 정보 상태
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        birthday: '',
        memo: '',
        allowsMarketing: false
    });

    // 입력값 변경 처리
    const handleInputChange = (field, value) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 폼 초기화
    const resetForm = () => {
        setCustomerData({
            name: '',
            phone: '',
            birthday: '',
            memo: '',
            allowsMarketing: false
        });
    };

    // 모달 닫기
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 등록 처리
    const handleSubmit = () => {
        // 필수 입력값 검증
        if (!customerData.name.trim()) {
            alert('고객명을 입력해주세요.');
            return;
        }
        
        if (!customerData.phone.trim()) {
            alert('연락처를 입력해주세요.');
            return;
        }

        if (!customerData.birthday) {
            alert('생년월일을 입력해주세요.');
            return;
        }

        // 전화번호 형식 검증 (간단한 검증)
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(customerData.phone)) {
            alert('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
            return;
        }

        onConfirm(customerData);
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div 
                className={`${styles.modal} ${styles.info}`}
                style={{ maxWidth: '400px', width: '90%' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                <div className={styles.modalHeader} style={{ paddingBottom: 'var(--spacing-lg)' }}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>👤</span>
                    </div>
                    <h3 className={styles.title}>신규 고객 추가</h3>
                </div>

                {/* 모달 본문 */}
                <div className={styles.modalBody} style={{ padding: '0 var(--spacing-2xl) var(--spacing-xl) var(--spacing-2xl)' }}>
                    {/* 기본 정보 섹션 */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: 'var(--spacing-md)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)'
                        }}>
                            📋 기본 정보
                        </div>
                        
                        {/* 고객명 */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 'var(--spacing-xs)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                fontWeight: 'var(--font-medium)'
                            }}>
                                고객명
                            </label>
                            <input
                                type="text"
                                placeholder="고객명"
                                value={customerData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* 생년월일 */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 'var(--spacing-xs)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                fontWeight: 'var(--font-medium)'
                            }}>
                                생년월일
                            </label>
                            <input
                                type="date"
                                value={customerData.birthday}
                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* 연락처 */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 'var(--spacing-xs)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                fontWeight: 'var(--font-medium)'
                            }}>
                                연락처
                            </label>
                            <input
                                type="tel"
                                placeholder="010-0000-0000"
                                value={customerData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* 광고성 수신 동의 */}
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={customerData.allowsMarketing}
                                    onChange={(e) => handleInputChange('allowsMarketing', e.target.checked)}
                                    style={{ 
                                        marginRight: 'var(--spacing-xs)',
                                        transform: 'scale(1.1)'
                                    }}
                                />
                                광고성 수신 동의
                            </label>
                        </div>
                    </div>

                    {/* 메모 섹션 */}
                    <div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: 'var(--spacing-md)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)'
                        }}>
                            📝 메모
                        </div>
                        
                        <textarea
                            placeholder="고객에 대한 메모를 입력하세요..."
                            value={customerData.memo}
                            onChange={(e) => handleInputChange('memo', e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-sm)',
                                outline: 'none',
                                resize: 'vertical',
                                transition: 'border-color 0.2s',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                </div>

                {/* 모달 푸터 */}
                <div className={styles.modalFooter}>
                    <button 
                        type="button"
                        className={`${styles.btn} ${styles.btnCancel}`}
                        onClick={handleClose}
                    >
                        취소
                    </button>
                    <button 
                        type="button"
                        className={`${styles.btn} ${styles.btnConfirm}`}
                        onClick={handleSubmit}
                    >
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}