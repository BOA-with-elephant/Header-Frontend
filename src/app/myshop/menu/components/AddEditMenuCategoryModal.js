'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/menu/AddEditMenuCategoryModal.module.css';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function AddMenuCategoryModal({ isOpen, onClose, onSuccess, initialData }) {
    const isEdit = !!initialData;
    const { modal, closeModal, showError, showConfirm } = useMessageModal();

    const [formData, setFormData] = useState({
        categoryName: '',
        menuColor: '#A5B4FC',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // const API_BASE_URL = 'http://localhost:8080/api/v1/my-shops/1';
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/1`;

    const colorOptions = [
        '#A5B4FC', '#FCA5A5', '#86EFAC', '#FDE047', '#C4B5FD',
        '#F9A8D4', '#D1D5DB', '#67E8F9', '#FBB6CE', '#DDD6FE', '#FDA4AF', '#E2E8F0'
    ];

    // 모달 열릴 때 초기값 설정
    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setFormData({
                    categoryName: initialData.categoryName || '',
                    menuColor: initialData.menuColor || '#A5B4FC',
                    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                });
                setError(null);
            } else {
                setFormData({ categoryName: '', menuColor: '#A5B4FC', isActive: true });
                setError(null);
            }
        }
    }, [isOpen, isEdit, initialData]);

    // ESC키 닫기 및 스크롤 방지
    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && isOpen && handleClose();
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, menuColor: color }));
    };

    const handleClose = () => {
        if (!loading) onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    // 에러 메시지 파싱 함수
    const parseErrorMessage = (response, defaultMessage) => {
        if (response.status === 400) return MESSAGES.COMMON.VALIDATION_ERROR;
        if (response.status === 409) return MESSAGES.CATEGORY.DUPLICATE_ERROR;
        if (response.status === 404) return MESSAGES.CATEGORY.NOT_FOUND;
        if (response.status === 500) return MESSAGES.COMMON.SERVER_ERROR;
        return defaultMessage;
    };

    // 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryName.trim()) {
            setError(MESSAGES.CATEGORY.VALIDATION_NAME);
            return;
        }

        const submitData = { ...formData, shopCode: 1 };

        try {
            setLoading(true);
            setError(null);

            let response;
            if (isEdit) {
                response = await fetch(`${API_BASE_URL}/menu/category/${initialData.categoryCode}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submitData)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/menu/category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submitData)
                });
            }

            if (!response.ok) {
                const defaultMessage = isEdit ? MESSAGES.CATEGORY.UPDATE_ERROR : MESSAGES.CATEGORY.CREATE_ERROR;
                const errorMessage = parseErrorMessage(response, defaultMessage);
                
                showError(
                    isEdit ? '수정 실패' : '등록 실패',
                    errorMessage
                );
                return;
            }

            const result = await response.json();
            onSuccess?.(result);
            onClose();

        } catch (err) {
            console.error(isEdit ? '카테고리 수정 실패:' : '카테고리 생성 실패:', err);
            showError('네트워크 오류', MESSAGES.COMMON.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    };

    // 삭제 처리
    const handleDelete = () => {
        showConfirm(
            '카테고리 삭제',
            MESSAGES.CATEGORY.DELETE_CONFIRM(initialData.categoryName),
            async () => {
                closeModal();
                setLoading(true);
                setError(null);

                try {
                    const response = await fetch(`${API_BASE_URL}/menu/category/${initialData.categoryCode}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorMessage = parseErrorMessage(response, MESSAGES.CATEGORY.DELETE_ERROR);
                        showError('삭제 실패', errorMessage);
                        return;
                    }

                    onSuccess?.();
                    onClose();

                } catch (err) {
                    console.error('카테고리 삭제 실패:', err);
                    showError('삭제 오류', MESSAGES.COMMON.NETWORK_ERROR);
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modalOverlay} onClick={handleBackdropClick}>
                <div className={styles.modalContainer}>
                    {/* 헤더 */}
                    <div className={styles.modalHeader}>
                        <h2>{isEdit ? '메뉴 카테고리 수정' : '메뉴 카테고리 추가'}</h2>
                        <button className={styles.closeButton} onClick={handleClose} disabled={loading}>✕</button>
                    </div>

                    <div className={styles.modalContent}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* 카테고리 이름 */}
                            <div className={styles.formGroup}>
                                <label htmlFor="categoryName" className={styles.label}>
                                    카테고리 이름 <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="categoryName"
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleInputChange}
                                    placeholder="예: 컷, 펌, 염색 등"
                                    className={styles.input}
                                    maxLength={50}
                                    autoFocus
                                />
                            </div>

                            {/* 색상 선택 */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>카테고리 색상 <span className={styles.required}>*</span></label>
                                <div className={styles.colorPreview}>
                                    <div className={styles.selectedColor} style={{ backgroundColor: formData.menuColor }}></div>
                                    <span>{formData.menuColor}</span>
                                </div>
                                <div className={styles.colorOptions}>
                                    {colorOptions.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`${styles.colorOption} ${formData.menuColor === color ? styles.selected : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleColorSelect(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <div className={styles.customColorInput}>
                                    <input type="color" value={formData.menuColor} onChange={e => handleColorSelect(e.target.value)} className={styles.colorPicker} />
                                    <input type="text" value={formData.menuColor} onChange={e => handleColorSelect(e.target.value)} placeholder="#FFFFFF" pattern="^#[0-9A-Fa-f]{6}$" className={styles.colorInput} />
                                </div>
                            </div>
                            
                            {/* 에러 메시지 */}
                            {error && <div className={styles.errorMessage}><span>{error}</span></div>}

                            {/* 버튼 영역 */}
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={loading}>
                                    취소
                                </button>
                                {isEdit && (
                                    <button type="button" onClick={handleDelete} className={styles.deleteButton} disabled={loading}>
                                        {loading ? '삭제 중...' : '삭제'}
                                    </button>
                                )}
                                <button type="submit" className={styles.submitButton} disabled={loading || !formData.categoryName.trim()}>
                                    {loading ? (isEdit ? '수정 중...' : '생성 중...') : (isEdit ? '카테고리 수정' : '카테고리 생성')}
                                </button>
                            </div>
                        </form>

                        {/* 미리보기 카드 */}
                        <div className={styles.preview}>
                            <h3>미리보기</h3>
                            <div className={styles.previewCard}>
                                <div className={styles.previewColor} style={{ backgroundColor: formData.menuColor }}></div>
                                <div className={styles.previewContent}>
                                    <span className={styles.previewName}>{formData.categoryName || '카테고리 이름'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메시지 모달 - 단 한 줄! */}
            <MessageModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                showCancel={modal.showCancel}
                confirmText={modal.type === 'confirm' ? '삭제' : '확인'}
                cancelText="취소"
            />
        </>
    );
}