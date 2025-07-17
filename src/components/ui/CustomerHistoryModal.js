'use client';

import { useEffect } from 'react';
import styles from '@/styles/common/MessageModal.module.css';

export default function CustomerHistoryModal({ 
    isOpen, 
    onClose, 
    title,
    historyData = []
}) {
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div 
                className={`${styles.modal} ${styles.info}`}
                style={{ maxWidth: '600px', width: '90%' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>📋</span>
                    </div>
                    <h3 className={styles.title}>{title}</h3>
                </div>

                <div className={styles.modalBody} style={{ padding: '0 var(--spacing-2xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
                    {historyData.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: 'var(--spacing-2xl)',
                            color: 'var(--text-secondary)'
                        }}>
                            아직 방문 기록이 없습니다.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse',
                                fontSize: 'var(--text-sm)'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderBottom: '2px solid var(--border-color)'
                                    }}>
                                        <th style={{ 
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            textAlign: 'left',
                                            fontWeight: 'var(--font-semibold)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            방문 날짜
                                        </th>
                                        <th style={{ 
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            textAlign: 'left',
                                            fontWeight: 'var(--font-semibold)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            시술 내역
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((visit, index) => (
                                        <tr key={index} style={{ 
                                            borderBottom: '1px solid var(--border-color)',
                                            backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'
                                        }}>
                                            <td style={{ 
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {new Date(visit.date).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </td>
                                            <td style={{ 
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {/* 메뉴가 한개씩 오는 경우 */}
                                                {typeof visit.services === 'string' ? (
                                                    <span 
                                                        style={{
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: '13px',
                                                            fontWeight: 'var(--font-medium)'
                                                        }}
                                                    >
                                                        {visit.services}
                                                    </span>
                                                ) : (
                                                    /* 배열인 경우 (기존 테스트 데이터 호환) */
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                                        {visit.services.map((service, serviceIndex) => (
                                                            <span 
                                                                key={serviceIndex}
                                                                style={{
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    color: 'white',
                                                                    padding: '4px 8px',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    fontSize: '13px',
                                                                    fontWeight: 'var(--font-medium)'
                                                                }}
                                                            >
                                                                {service}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ 
                                        borderTop: '2px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        fontWeight: 'var(--font-semibold)'
                                    }}>
                                        <td style={{ 
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            총 방문 횟수
                                        </td>
                                        <td style={{ 
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            color: 'var(--text-primary)',
                                            textAlign: 'center',
                                            fontWeight: 'var(--font-bold)'
                                        }}>
                                            {historyData.length}회
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button 
                        type="button"
                        className={`${styles.btn} ${styles.btnConfirm}`}
                        onClick={onClose}
                        style={{ width: '100%' }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}