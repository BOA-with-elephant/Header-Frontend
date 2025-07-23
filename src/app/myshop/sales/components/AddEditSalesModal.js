"use client";

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/sales/AddEditSalesModal.module.css';

export default function AddEditSalesModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    initialData = null,
    customers = [], 
    menus = []
}) {
    // 상태 관리
    const [formData, setFormData] = useState({
        userCode: '',
        menuCode: '',
        payAmount: '',
        payMethod: '신용카드',
        customerName: '',
        customerPhone: '',
        serviceName: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservationLoading, setReservationLoading] = useState(false);
    
    // 상수
    const isEdit = !!initialData?.salesCode;
    const API_BASE_URL = 'http://localhost:8080/api/v1/my-shops/1';
    const RESERVATION_API_URL = 'http://localhost:8080/my-shops/1/reservation';

    // 유틸리티 함수
    const getToday = () => new Date().toISOString().split('T')[0];
    
    // 예약 목록 조회
    const fetchReservations = async (date) => {
        if (!date) return;
        setReservationLoading(true);
        
        try {
            const response = await fetch(`${RESERVATION_API_URL}?resvDate=${date}`);
            if (response.ok) {
                const data = await response.json();
                setReservations(data.filter(r => r.resvState === 'APPROVE'));
            }
        } catch (error) {
            console.error('예약 조회 실패:', error);
            setReservations([]);
        } finally {
            setReservationLoading(false);
        }
    };

    // 예약 선택 처리
    const selectReservation = (reservation) => {
        setSelectedReservation(reservation);
        
        const customer = customers.find(c => 
            c.userName === reservation.userName && c.userPhone === reservation.userPhone
        );
        const menu = menus.find(m => m.menuName === reservation.menuName);
        
        setFormData({
            userCode: customer?.userCode?.toString() || '',
            menuCode: menu?.menuCode?.toString() || '',
            payAmount: '',
            payMethod: '신용카드',
            customerName: reservation.userName || '',
            customerPhone: reservation.userPhone || '',
            serviceName: reservation.menuName || ''
        });
    };
    
    // 폼 초기화
    const initializeForm = () => {
        if (isEdit) {
            setFormData({
                userCode: initialData.userCode?.toString() || '',
                menuCode: initialData.menuCode?.toString() || '',
                payAmount: initialData.finalAmount?.toString() || '',
                payMethod: initialData.paymentMethod || '신용카드',
                customerName: initialData.customerName || '',
                customerPhone: initialData.customerPhone || '',
                serviceName: initialData.serviceName || ''
            });
        } else {
            const today = getToday();
            setSelectedDate(today);
            setFormData({
                userCode: '',
                menuCode: '',
                payAmount: '',
                payMethod: '신용카드',
                customerName: '',
                customerPhone: '',
                serviceName: ''
            });
            fetchReservations(today);
        }
        setError('');
        setSelectedReservation(null);
    };

    // Effects
    useEffect(() => {
        if (isOpen) initializeForm();
    }, [isOpen, initialData]);

    useEffect(() => {
        if (selectedDate && !isEdit) {
            fetchReservations(selectedDate);
            setSelectedReservation(null);
        }
    }, [selectedDate, isEdit]);

    useEffect(() => {
        if (!isEdit && formData.menuCode && !selectedReservation && menus.length > 0) {
            const menu = menus.find(m => m.menuCode.toString() === formData.menuCode);
            if (menu) {
                setFormData(prev => ({ ...prev, serviceName: menu.menuName }));
            }
        }
    }, [formData.menuCode, selectedReservation, menus.length, isEdit]);

    useEffect(() => {
        if (!isEdit && formData.userCode && !selectedReservation && customers.length > 0) {
            const customer = customers.find(c => c.userCode.toString() === formData.userCode);
            if (customer) {
                setFormData(prev => ({ 
                    ...prev, 
                    customerName: customer.userName,
                    customerPhone: customer.userPhone
                }));
            }
        }
    }, [formData.userCode, selectedReservation, customers.length, isEdit]);

    // 이벤트 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    // 유효성 검사
    const validateForm = () => {
        if (!formData.customerName) return '고객 정보가 필요합니다.';
        if (!formData.serviceName) return '시술 정보가 필요합니다.';
        if (!formData.payAmount || parseInt(formData.payAmount) <= 0) return '결제 금액을 입력해주세요.';
        return null;
    };

    // 제출 데이터 구성
    const buildSubmitData = () => {
        const payAmount = parseInt(formData.payAmount);
        
        if (isNaN(payAmount) || payAmount <= 0) {
            throw new Error('결제 금액이 유효하지 않습니다.');
        }
        if (!formData.customerName || !formData.serviceName) {
            throw new Error('고객명 또는 시술명이 누락되었습니다.');
        }

        const submitData = {
            salesCode: isEdit ? (initialData.salesCode || initialData.id) : null,
            resvCode: isEdit ? (initialData.resvCode || null) : (selectedReservation?.resvCode || null),
            payAmount: payAmount,
            payMethod: formData.payMethod,
            payDatetime: isEdit ? initialData.payDatetime : null,
            payStatus: 'COMPLETED',
            cancelAmount: isEdit ? (initialData.cancelAmount || 0) : 0,
            cancelDatetime: isEdit ? initialData.cancelDatetime : null,
            cancelReason: isEdit ? initialData.cancelReason : null,
            finalAmount: payAmount, // 수정된 금액으로 업데이트
            statusNote: isEdit ? initialData.statusNote : null,
            userName: formData.customerName,
            userPhone: formData.customerPhone || '',
            menuName: formData.serviceName,
            menuPrice: payAmount
        };

        console.log('=== 제출 데이터 구성 완료 ===');
        console.log('수정 모드:', isEdit);
        console.log('원본 데이터:', initialData);
        console.log('폼 데이터:', formData);
        console.log('최종 제출 데이터:', submitData);

        return submitData;
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = isEdit 
                ? `${API_BASE_URL}/sales/${initialData.salesCode}`
                : `${API_BASE_URL}/sales`;
            
            const submitData = buildSubmitData();
            
            console.log('=== API 요청 정보 ===');
            console.log('요청 URL:', url);
            console.log('요청 방법:', isEdit ? 'PUT' : 'POST');
            console.log('요청 데이터:', JSON.stringify(submitData, null, 2));
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            console.log('=== API 응답 정보 ===');
            console.log('응답 상태:', response.status);
            console.log('응답 상태 텍스트:', response.statusText);

            if (!response.ok) {
                let errorMessage = '서버 오류가 발생했습니다.';
                
                try {
                    const errorData = await response.json();
                    console.error('에러 응답 데이터:', errorData);
                    if (errorData.details && Array.isArray(errorData.details)) {
                        errorMessage = errorData.details.join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    const errorText = await response.text();
                    console.error('에러 응답 텍스트:', errorText);
                    if (errorText) errorMessage = errorText;
                }
                
                throw new Error(`${isEdit ? '수정' : '등록'}에 실패했습니다. ${errorMessage}`);
            }

            const result = await response.json();
            console.log('=== API 성공 응답 ===');
            console.log('응답 데이터:', result);
            
            if (isEdit) {
                console.log('매출 수정 완료 - 수정된 데이터:', result);
                console.log('수정 성공: 데이터 새로고침을 위해 onSuccess 호출');
            } else if (selectedReservation?.resvCode) {
                console.log('예약 기반 매출 등록 완료 - 예약 상태는 백엔드에서 자동 업데이트됨');
            }

            // 성공 시 부모 컴포넌트에 알려서 데이터 새로고침
            if (typeof onSuccess === 'function') {
                onSuccess(result); // 수정된 데이터를 함께 전달
            }
            onClose();
            
        } catch (err) {
            console.error('매출 등록/수정 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 렌더링
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className={styles.modalHeader}>
                    <h2>{isEdit ? '매출 수정' : '매출 등록'}</h2>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalBody}>
                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* 예약 선택 (등록 모드만) */}
                    {!isEdit && (
                        <div className={styles.reservationSection}>
                            <div className={styles.formGroup}>
                                <label htmlFor="selectedDate">날짜 선택 *</label>
                                <input
                                    type="date"
                                    id="selectedDate"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className={styles.textInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>예약 목록 (예약확정만)</label>
                                {reservationLoading ? (
                                    <div className={styles.loadingText}>예약 목록 로딩 중...</div>
                                ) : reservations.length > 0 ? (
                                    <div className={styles.reservationList}>
                                        {reservations.map((reservation) => (
                                            <div
                                                key={reservation.resvCode}
                                                className={`${styles.reservationItem} ${
                                                    selectedReservation?.resvCode === reservation.resvCode ? styles.selected : ''
                                                }`}
                                                onClick={() => selectReservation(reservation)}
                                            >
                                                <div><strong>{reservation.resvTime}</strong></div>
                                                <div>{reservation.userName} ({reservation.userPhone})</div>
                                                <div style={{ color: reservation.menuColor }}>{reservation.menuName}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyMessage}>해당 날짜에 예약확정된 예약이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 매출 정보 입력 */}
                    <div className={styles.formSection}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>고객 정보 *</label>
                                {isEdit || selectedReservation ? (
                                    <div className={styles.displayInfo}>
                                        <div className={styles.displayValue}>
                                            {formData.customerName} ({formData.customerPhone})
                                        </div>
                                        <small>
                                            {isEdit ? '수정 시에는 고객 정보를 변경할 수 없습니다.' : '선택된 예약의 고객 정보'}
                                        </small>
                                    </div>
                                ) : (
                                    <select
                                        name="userCode"
                                        value={formData.userCode}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        <option value="">고객 선택</option>
                                        {customers.map(customer => (
                                            <option key={customer.userCode} value={customer.userCode}>
                                                {customer.userName} ({customer.userPhone})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>시술 정보 *</label>
                                {isEdit || selectedReservation ? (
                                    <div className={styles.displayInfo}>
                                        <div className={styles.displayValue}>{formData.serviceName}</div>
                                        <small>
                                            {isEdit ? '수정 시에는 시술 정보를 변경할 수 없습니다.' : '선택된 예약의 시술 정보'}
                                        </small>
                                    </div>
                                ) : (
                                    <select
                                        name="menuCode"
                                        value={formData.menuCode}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        <option value="">시술 선택</option>
                                        {menus.map(menu => (
                                            <option key={menu.menuCode} value={menu.menuCode}>
                                                {menu.menuName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="payAmount">결제 금액 *</label>
                                <input
                                    type="text"
                                    id="payAmount"
                                    name="payAmount"
                                    value={formData.payAmount}
                                    onChange={handleNumberChange}
                                    placeholder="결제 금액을 입력하세요"
                                    disabled={loading}
                                    className={styles.textInput}
                                />
                                <small className={styles.helpText}>
                                    실제 받은 금액을 입력해주세요.
                                </small>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="payMethod">결제 방법 *</label>
                                <select
                                    id="payMethod"
                                    name="payMethod"
                                    value={formData.payMethod}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={styles.selectInput}
                                >
                                    <option value="신용카드">신용카드</option>
                                    <option value="현금">현금</option>
                                    <option value="카카오페이">카카오페이</option>
                                    <option value="계좌이체">계좌이체</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.finalAmountSection}>
                            <span>최종 금액: </span>
                            <strong>{parseInt(formData.payAmount || 0).toLocaleString()}원</strong>
                        </div>
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
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? '처리 중...' : 
                             isEdit ? '수정' :
                             selectedReservation ? '매출 등록 + 시술완료' : 
                             '매출 등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}