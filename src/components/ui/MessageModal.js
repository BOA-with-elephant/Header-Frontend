'use client';

import { useEffect } from 'react';
import styles from '@/styles/common/MessageModal.module.css';

export default function MessageModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    type = 'info', // 'success', 'error', 'warning', 'confirm', 'info'
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    showCancel = false
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

    // 확인 버튼 클릭
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    // 아이콘 반환
    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'confirm': return '❓';
            default: return 'ℹ️';
        }
    };

    // 타입별 스타일 클래스
    const getTypeClass = () => {
        switch (type) {
            case 'success': return styles.success;
            case 'error': return styles.error;
            case 'warning': return styles.warning;
            case 'confirm': return styles.confirm;
            default: return styles.info;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div 
                className={`${styles.modal} ${getTypeClass()}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>{getIcon()}</span>
                    </div>
                    {title && <h3 className={styles.title}>{title}</h3>}
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.modalFooter}>
                    {showCancel && (
                        <button 
                            type="button"
                            className={`${styles.btn} ${styles.btnCancel}`}
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button 
                        type="button"
                        className={`${styles.btn} ${styles.btnConfirm}`}
                        onClick={handleConfirm}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}