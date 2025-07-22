'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/menu/AddEditMenuModal.module.css';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function AddEditMenuModal({ isOpen, onClose, onSuccess, initialData = null, categories = [] }) {
    const { modal, closeModal, showError, showConfirm } = useMessageModal();
    
    const [formData, setFormData] = useState({
        menuName: '',
        categoryCode: '',
        menuHours: '0',
        menuMinutes: '0',
        menuPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:8080/api/v1/my-shops/1';
    const isEdit = !!initialData;

    // 모달이 열릴 때 초기 데이터 설정
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const duration = initialData.estTime || initialData.menuDuration || initialData.duration || 0;
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                
                setFormData({
                    menuName: initialData.menuName || '',
                    categoryCode: initialData.categoryCode?.toString() || '',
                    menuHours: hours.toString(),
                    menuMinutes: minutes.toString(),
                    menuPrice: initialData.menuPrice?.toString() || ''
                });
            } else {
                setFormData({
                    menuName: '',
                    categoryCode: '',
                    menuHours: '0',
                    menuMinutes: '0',
                    menuPrice: ''
                });
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const numberValue = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: numberValue }));
    };

    // 유효성 검사
    const validateForm = () => {
        if (!formData.categoryCode) {
            setError(MESSAGES.MENU.VALIDATION_CATEGORY);
            return false;
        }
        if (!formData.menuName.trim()) {
            setError(MESSAGES.MENU.VALIDATION_NAME);
            return false;
        }
        const totalMinutes = parseInt(formData.menuHours) * 60 + parseInt(formData.menuMinutes);
        if (totalMinutes <= 0) {
            setError(MESSAGES.MENU.VALIDATION_TIME);
            return false;
        }
        if (!formData.menuPrice) {
            setError(MESSAGES.MENU.VALIDATION_PRICE);
            return false;
        }
        return true;
    };

    // 에러 메시지 파싱 함수
    const parseErrorMessage = (response, defaultMessage) => {
        switch (response.status) {
            case 400: return MESSAGES.COMMON.VALIDATION_ERROR;
            case 404: return MESSAGES.MENU.NOT_FOUND;
            case 500: return MESSAGES.COMMON.SERVER_ERROR;
            default: return defaultMessage;
        }
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const url = isEdit 
                ? `${API_BASE_URL}/menu/${initialData.menuCode}`
                : `${API_BASE_URL}/menu`;
            
            const method = isEdit ? 'PUT' : 'POST';
            const durationInMinutes = parseInt(formData.menuHours) * 60 + parseInt(formData.menuMinutes);
            
            const submitData = {
                menuName: formData.menuName.trim(),
                categoryCode: parseInt(formData.categoryCode),
                menuPrice: parseInt(formData.menuPrice),
                estTime: durationInMinutes,
                shopCode: 1
            };

            if (isEdit && initialData.menuCode) {
                submitData.menuCode = initialData.menuCode;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                const defaultMessage = isEdit ? MESSAGES.MENU.UPDATE_ERROR : MESSAGES.MENU.CREATE_ERROR;
                let errorMessage = defaultMessage;
                
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || defaultMessage;
                    } else {
                        errorMessage = parseErrorMessage(response, defaultMessage);
                    }
                } catch (parseError) {
                    errorMessage = parseErrorMessage(response, defaultMessage);
                }
                
                setError(errorMessage);
                return;
            }

            // 성공 처리
            let result = null;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    result = { success: true, menuName: formData.menuName };
                }
            } catch (parseError) {
                result = { success: true, menuName: formData.menuName };
            }
            
            onSuccess(result);
            onClose();
            
        } catch (err) {
            console.error('Network error:', err);
            
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                showError('네트워크 오류', MESSAGES.COMMON.NETWORK_ERROR);
            } else {
                showError('처리 오류', `${MESSAGES.COMMON.PROCESS_ERROR}\n${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 삭제 처리
    const handleDelete = () => {
        showConfirm(
            '시술 삭제',
            MESSAGES.MENU.DELETE_CONFIRM(initialData.menuName),
            async () => {
                closeModal();
                setLoading(true);
                setError('');

                try {
                    const response = await fetch(`${API_BASE_URL}/menu/${initialData.menuCode}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorMessage = parseErrorMessage(response, MESSAGES.MENU.DELETE_ERROR);
                        showError('삭제 실패', errorMessage);
                        return;
                    }

                    onSuccess();
                    onClose();
                    
                } catch (err) {
                    console.error('Delete error:', err);
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
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>{isEdit ? '시술 수정' : '시술 등록'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.modalBody}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="categoryCode">
                                시술 그룹 <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    id="categoryCode"
                                    name="categoryCode"
                                    value={formData.categoryCode}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={styles.selectInput}
                                >
                                    <option value="">시술 그룹 선택</option>
                                    {categories.map(category => (
                                        <option key={category.categoryCode} value={category.categoryCode.toString()}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="menuName">
                                시술 이름 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="menuName"
                                name="menuName"
                                value={formData.menuName}
                                onChange={handleChange}
                                placeholder="시술 이름을 입력해 주세요."
                                maxLength={100}
                                disabled={loading}
                                className={styles.textInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                시술 시간 <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.timeInputGroup}>
                                <div className={styles.selectWrapper}>
                                    <select
                                        name="menuHours"
                                        value={formData.menuHours}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        {Array.from({ length: 25 }, (_, i) => (
                                            <option key={i} value={i.toString()}>
                                                {i} 시간
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.selectWrapper}>
                                    <select
                                        name="menuMinutes"
                                        value={formData.menuMinutes}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i * 5} value={(i * 5).toString()}>
                                                {i * 5} 분
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="menuPrice">
                                가격 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="menuPrice"
                                name="menuPrice"
                                value={formData.menuPrice}
                                onChange={handleNumberChange}
                                placeholder="시술 가격을 입력해 주세요."
                                disabled={loading}
                                className={styles.textInput}
                            />
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={loading}
                            >
                                취소
                            </button>
                            {isEdit && (
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading ? '삭제 중...' : '삭제'}
                                </button>
                            )}
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? '처리 중...' : (isEdit ? '수정' : '등록')}
                            </button>
                        </div>
                    </form>
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