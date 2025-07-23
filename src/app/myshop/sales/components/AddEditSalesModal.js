'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/sales/AddEditSalesModal.module.css';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import { MESSAGES } from '@/constants/messages';

export default function AddEditSalesModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    initialData = null, 
    customers = [], 
    menus = [],
    reservationData = [] // 예약 데이터 추가
}) {
    const { modal, closeModal, showError, showConfirm } = useMessageModal();
    
    const [formData, setFormData] = useState({
        userCode: '',
        menuCode: '',
        resvDate: '',
        resvTime: '',
        payAmount: '',
        payMethod: '신용카드',
        payStatus: 'COMPLETED',
        cancelAmount: '0',
        cancelReason: '',
        userComment: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isFromReservation, setIsFromReservation] = useState(false);
    
    // 예약 관련 상태
    const [selectedDate, setSelectedDate] = useState('');
    const [reservationList, setReservationList] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservationLoading, setReservationLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:8080/api/v1/my-shops/1';
    const RESERVATION_API_BASE_URL = 'http://localhost:8080/my-shops/1/reservation';
    const isEdit = !!initialData && !initialData.isFromReservation;

    // 오늘 날짜를 기본값으로 설정
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // 현재 시간을 기본값으로 설정
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // 예약 목록 조회 (예약확정 상태만)
    const fetchReservationsByDate = async (date) => {
        if (!date) return;
        
        setReservationLoading(true);
        try {
            const response = await fetch(`${RESERVATION_API_BASE_URL}?resvDate=${date}`);
            if (!response.ok) throw new Error('예약 목록을 불러올 수 없습니다.');
            
            const data = await response.json();
            
            // 예약확정 상태의 예약만 필터링
            const approvedReservations = data.filter(item => 
                item.resvState === 'APPROVE' || item.resvState === '예약확정'
            );
            
            setReservationList(approvedReservations);
        } catch (error) {
            console.error('예약 목록 조회 실패:', error);
            showError('조회 실패', '해당 날짜의 예약 목록을 불러올 수 없습니다.');
            setReservationList([]);
        } finally {
            setReservationLoading(false);
        }
    };

    // 예약 선택 시 폼 데이터 자동 설정 (BossResvProjectionDTO 구조)
    const handleReservationSelect = (reservation) => {
        setSelectedReservation(reservation);
        setIsFromReservation(true);
        
        console.log('선택된 예약 (BossResvProjectionDTO):', reservation);
        
        // 고객 정보 찾기 (userName과 userPhone으로 매칭)
        const customer = Array.isArray(customers) ? 
            customers.find(c => c.userName === reservation.userName && c.userPhone === reservation.userPhone) : null;
        
        // 메뉴 정보 찾기 (menuName으로 매칭)
        const menu = Array.isArray(menus) ? 
            menus.find(m => m.menuName === reservation.menuName) : null;
        
        console.log('찾은 고객:', customer);
        console.log('찾은 메뉴:', menu);
        
        // BossResvProjectionDTO에는 userCode, menuCode가 없으므로 찾은 것 사용
        const finalUserCode = customer?.userCode;
        const finalMenuCode = menu?.menuCode;
        const finalMenuPrice = menu?.menuPrice || 50000; // 기본 가격
        
        setFormData({
            userCode: finalUserCode?.toString() || '',
            menuCode: finalMenuCode?.toString() || '',
            resvDate: reservation.resvDate || '',
            resvTime: reservation.resvTime || '',
            payAmount: finalMenuPrice?.toString() || '',
            payMethod: '신용카드',
            payStatus: 'COMPLETED',
            cancelAmount: '0',
            cancelReason: '',
            userComment: reservation.userComment || ''
        });
        
        // 선택된 메뉴 정보 설정
        const selectedMenuInfo = {
            menuCode: finalMenuCode,
            menuName: reservation.menuName,
            menuPrice: finalMenuPrice,
            menuColor: reservation.menuColor || '#007bff',
            categoryName: '기본'
        };
        setSelectedMenu(selectedMenuInfo);
        
        console.log('설정된 formData:', {
            userCode: finalUserCode?.toString() || '',
            menuCode: finalMenuCode?.toString() || '',
            payAmount: finalMenuPrice?.toString() || ''
        });
    };

    // 모달이 열릴 때 초기 데이터 설정
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // 예약에서 매출 등록하는 경우
                if (initialData.isFromReservation) {
                    setIsFromReservation(true);
                    setFormData({
                        userCode: initialData.userCode?.toString() || '',
                        menuCode: initialData.menuCode?.toString() || '',
                        resvDate: initialData.date || '',
                        resvTime: initialData.time || '',
                        payAmount: initialData.servicePrice?.toString() || '',
                        payMethod: '신용카드',
                        payStatus: 'COMPLETED',
                        cancelAmount: '0',
                        cancelReason: '',
                        userComment: initialData.memo || ''
                    });
                } else {
                    // 기존 매출 수정하는 경우
                    setIsFromReservation(false);
                    setFormData({
                        userCode: initialData.userCode?.toString() || '',
                        menuCode: initialData.menuCode?.toString() || '',
                        resvDate: initialData.date || '',
                        resvTime: initialData.time || '',
                        payAmount: initialData.servicePrice?.toString() || '',
                        payMethod: initialData.paymentMethod || '신용카드',
                        payStatus: initialData.status || 'COMPLETED',
                        cancelAmount: initialData.cancelAmount?.toString() || '0',
                        cancelReason: initialData.cancelReason || '',
                        userComment: initialData.memo || ''
                    });
                }
                
                // 선택된 메뉴 정보 설정
                const menu = menus.find(m => m.menuCode === initialData.menuCode);
                setSelectedMenu(menu);
            } else {
                // 새로운 매출 등록 - 예약에서만 등록 가능
                setIsFromReservation(false);
                setSelectedDate(getTodayDate());
                setFormData({
                    userCode: '',
                    menuCode: '',
                    resvDate: getTodayDate(),
                    resvTime: getCurrentTime(),
                    payAmount: '',
                    payMethod: '신용카드',
                    payStatus: 'COMPLETED',
                    cancelAmount: '0',
                    cancelReason: '',
                    userComment: ''
                });
                setSelectedMenu(null);
                setSelectedReservation(null);
                
                // 오늘 날짜의 예약 목록 자동 조회
                fetchReservationsByDate(getTodayDate());
            }
            setError('');
        }
    }, [isOpen, initialData, menus, customers]);

    // 날짜 변경 시 예약 목록 조회
    useEffect(() => {
        if (selectedDate && !isEdit) {
            fetchReservationsByDate(selectedDate);
        }
    }, [selectedDate, isEdit]);

    // 메뉴 선택 시 가격 자동 설정
    useEffect(() => {
        if (formData.menuCode && !isFromReservation && Array.isArray(menus)) {
            const menu = menus.find(m => m.menuCode.toString() === formData.menuCode);
            if (menu) {
                setSelectedMenu(menu);
                setFormData(prev => ({ 
                    ...prev, 
                    payAmount: menu.menuPrice.toString() 
                }));
            }
        }
    }, [formData.menuCode, menus, isFromReservation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const numberValue = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: numberValue }));
    };

    // 날짜 선택 변경
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedReservation(null);
        setFormData(prev => ({ 
            ...prev, 
            resvDate: date,
            userCode: '',
            menuCode: '',
            payAmount: '',
            userComment: ''
        }));
    };

    // 최종 금액 계산
    const getFinalAmount = () => {
        const payAmount = parseInt(formData.payAmount) || 0;
        const cancelAmount = parseInt(formData.cancelAmount) || 0;
        
        if (formData.payStatus === 'CANCELLED') {
            return 0;
        } else if (formData.payStatus === 'PARTIAL_CANCELLED') {
            return payAmount - cancelAmount;
        }
        return payAmount;
    };

    // 유효성 검사
    const validateForm = () => {
        if (!selectedReservation && !isEdit) {
            setError('예약을 선택해주세요.');
            return false;
        }
        if (!formData.userCode) {
            setError('고객을 선택해주세요.');
            return false;
        }
        if (!formData.menuCode) {
            setError('시술을 선택해주세요.');
            return false;
        }
        if (!formData.payAmount || parseInt(formData.payAmount) <= 0) {
            setError('결제 금액을 입력해주세요.');
            return false;
        }
        if (!formData.resvDate) {
            setError('시술 날짜를 선택해주세요.');
            return false;
        }
        if (!formData.resvTime) {
            setError('시술 시간을 선택해주세요.');
            return false;
        }
        if (formData.payStatus === 'PARTIAL_CANCELLED' && parseInt(formData.cancelAmount) >= parseInt(formData.payAmount)) {
            setError('부분취소 금액은 결제 금액보다 작아야 합니다.');
            return false;
        }
        if ((formData.payStatus === 'CANCELLED' || formData.payStatus === 'PARTIAL_CANCELLED') && !formData.cancelReason.trim()) {
            setError('취소 사유를 입력해주세요.');
            return false;
        }
        return true;
    };

    // 에러 메시지 파싱 함수
    const parseErrorMessage = (response, defaultMessage) => {
        switch (response.status) {
            case 400: return '잘못된 요청입니다.';
            case 404: return '요청한 데이터를 찾을 수 없습니다.';
            case 409: return '이미 등록된 매출입니다.';
            case 500: return '서버 오류가 발생했습니다.';
            default: return defaultMessage;
        }
    };

    // 예약 상태를 시술완료로 변경
    const updateReservationStatus = async (resvCode) => {
        try {
            const response = await fetch(`${RESERVATION_API_BASE_URL}/${resvCode}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resvState: 'FINISH' })
            });
            
            if (!response.ok) {
                console.warn('예약 상태 업데이트 실패, 매출 등록은 계속 진행');
            }
        } catch (error) {
            console.warn('예약 상태 업데이트 오류:', error);
        }
    };

    // SalesDetailDTO 형태로 데이터 구성
    const buildSalesDetailDTO = () => {
        const finalAmount = getFinalAmount();
        const currentDateTime = new Date().toISOString();
        
        // 날짜와 시간을 올바른 형식으로 변환
        const resvDate = formData.resvDate; // "2025-08-05" 형식
        const resvTime = formData.resvTime; // "10:00" 형식
        
        // 예약이 선택된 경우 예약 데이터 우선 사용 (BossResvProjectionDTO 구조)
        let userCode, menuCode, userName, userPhone, menuName, menuPrice;
        
        if (selectedReservation) {
            // BossResvProjectionDTO는 평면 구조
            userName = selectedReservation.userName || '';
            userPhone = selectedReservation.userPhone || '';
            menuName = selectedReservation.menuName || '';
            
            // userCode, menuCode는 없으므로 고객/메뉴 목록에서 찾기
            const customer = Array.isArray(customers) ? 
                customers.find(c => c.userName === userName && c.userPhone === userPhone) : null;
            const menu = Array.isArray(menus) ? 
                menus.find(m => m.menuName === menuName) : null;
                
            userCode = customer?.userCode || parseInt(formData.userCode) || 0;
            menuCode = menu?.menuCode || parseInt(formData.menuCode) || 0;
            menuPrice = menu?.menuPrice || parseInt(formData.payAmount) || 0;
        } else {
            userCode = parseInt(formData.userCode) || 0;
            menuCode = parseInt(formData.menuCode) || 0;
            userName = Array.isArray(customers) ? (customers.find(c => c.userCode.toString() === formData.userCode)?.userName || '') : '';
            userPhone = Array.isArray(customers) ? (customers.find(c => c.userCode.toString() === formData.userCode)?.userPhone || '') : '';
            menuName = Array.isArray(menus) ? (menus.find(m => m.menuCode.toString() === formData.menuCode)?.menuName || '') : '';
            menuPrice = Array.isArray(menus) ? (menus.find(m => m.menuCode.toString() === formData.menuCode)?.menuPrice || 0) : 0;
        }
        
        const submitData = {
            // Sales 관련 필드
            salesCode: isEdit ? (initialData.salesCode || initialData.id) : null,
            resvCode: selectedReservation?.resvCode || null,
            payAmount: parseInt(formData.payAmount) || 0,
            payMethod: formData.payMethod || '신용카드',
            payDatetime: currentDateTime,
            payStatus: formData.payStatus || 'COMPLETED',
            cancelAmount: parseInt(formData.cancelAmount) || 0,
            cancelDatetime: (formData.payStatus === 'CANCELLED' || formData.payStatus === 'PARTIAL_CANCELLED') ? currentDateTime : null,
            cancelReason: formData.cancelReason ? formData.cancelReason.trim() : null,
            finalAmount: finalAmount,
            
            // Reservation 관련 필드
            shopCode: 1,
            userCode: userCode,
            menuCode: menuCode,
            resvDate: resvDate,
            resvTime: resvTime,
            userComment: formData.userComment ? formData.userComment.trim() : null,
            
            // User/Menu 관련 필드
            userName: userName,
            userPhone: userPhone,
            menuName: menuName,
            menuPrice: menuPrice,
            menuColor: selectedReservation?.menuColor || 
                      (Array.isArray(menus) ? (menus.find(m => m.menuCode.toString() === formData.menuCode)?.menuColor || '#007bff') : '#007bff'),
            categoryName: selectedReservation?.categoryName || 
                         (Array.isArray(menus) ? (menus.find(m => m.menuCode.toString() === formData.menuCode)?.categoryName || '기본') : '기본')
        };
        
        console.log('전송할 데이터:', submitData);
        return submitData;
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const url = isEdit 
                ? `${API_BASE_URL}/sales/${initialData.salesCode || initialData.id}`
                : `${API_BASE_URL}/sales`;
            
            const method = isEdit ? 'PUT' : 'POST';
            const submitData = buildSalesDetailDTO();

            console.log('전송할 데이터:', submitData); // 디버깅용

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                const defaultMessage = isEdit ? '매출 수정에 실패했습니다.' : '매출 등록에 실패했습니다.';
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

            // 예약 기반 매출 등록 시 예약 상태를 시술완료로 변경
            if (!isEdit && selectedReservation?.resvCode) {
                await updateReservationStatus(selectedReservation.resvCode);
            }

            // 성공 처리
            let result = null;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    result = { success: true };
                }
            } catch (parseError) {
                result = { success: true };
            }
            
            onSuccess(result);
            onClose();
            
        } catch (err) {
            console.error('Network error:', err);
            
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                showError('네트워크 오류', '네트워크 연결을 확인해주세요.');
            } else {
                showError('처리 오류', `처리 중 오류가 발생했습니다.\n${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 삭제 처리
    const handleDelete = () => {
        const customerName = Array.isArray(customers) ? 
            (customers.find(c => c.userCode.toString() === formData.userCode)?.userName || '고객') : '고객';
        showConfirm(
            '매출 삭제',
            `${customerName} 고객의 매출 내역을 삭제하시겠습니까?`,
            async () => {
                closeModal();
                setLoading(true);
                setError('');

                try {
                    const response = await fetch(`${API_BASE_URL}/sales/${initialData.salesCode || initialData.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorMessage = parseErrorMessage(response, '매출 삭제에 실패했습니다.');
                        showError('삭제 실패', errorMessage);
                        return;
                    }

                    onSuccess();
                    onClose();
                    
                } catch (err) {
                    console.error('Delete error:', err);
                    showError('삭제 오류', '네트워크 연결을 확인해주세요.');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    if (!isOpen) return null;

    // 모달 제목 결정
    const getModalTitle = () => {
        if (isFromReservation || selectedReservation) return '예약 → 매출 등록';
        if (isEdit) return '매출 수정';
        return '예약에서 매출 등록';
    };

    // 예약 상태 텍스트 변환
    const getReservationStatusText = (status) => {
        switch(status) {
            case 'APPROVE': return '예약확정';
            case 'FINISH': return '시술완료';
            case 'CANCEL': return '예약취소';
            default: return status;
        }
    };

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>{getModalTitle()}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.modalBody}>
                        {error && <div className={styles.error}>{error}</div>}

                        {/* 예약 선택 섹션 - 수정 모드가 아닐 때만 표시 */}
                        {!isEdit && (
                            <div className={styles.reservationSection}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="selectedDate">
                                        날짜 선택 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="selectedDate"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className={styles.textInput}
                                    />
                                </div>

                                <div className={styles.reservationListSection}>
                                    <label>예약 목록 (예약확정만 표시)</label>
                                    {reservationLoading ? (
                                        <div className={styles.loadingText}>예약 목록을 불러오는 중...</div>
                                    ) : reservationList.length > 0 ? (
                                        <div className={styles.reservationList}>
                                            {reservationList.map((reservation) => (
                                                <div
                                                    key={reservation.resvCode}
                                                    className={`${styles.reservationItem} ${
                                                        selectedReservation?.resvCode === reservation.resvCode ? styles.selected : ''
                                                    }`}
                                                    onClick={() => handleReservationSelect(reservation)}
                                                >
                                                    <div className={styles.reservationInfo}>
                                                        <div className={styles.reservationTime}>
                                                            🕐 {reservation.resvTime}
                                                        </div>
                                                        <div className={styles.reservationCustomer}>
                                                            👤 {reservation.userName} ({reservation.userPhone})
                                                        </div>
                                                        <div className={styles.reservationMenu}>
                                                            <span style={{ color: reservation.menuColor || '#007bff' }}>●</span> {reservation.menuName}
                                                        </div>
                                                        <div className={styles.reservationStatus}>
                                                            📋 {getReservationStatusText(reservation.resvState)}
                                                        </div>
                                                        {reservation.userComment && (
                                                            <div className={styles.reservationComment}>
                                                                💬 {reservation.userComment}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.emptyReservation}>
                                            해당 날짜에 예약확정된 예약이 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 매출 입력 폼 */}
                        <div className={styles.formSection}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="userCode">
                                        고객 <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            id="userCode"
                                            name="userCode"
                                            value={formData.userCode}
                                            onChange={handleChange}
                                            disabled={loading || (isFromReservation && selectedReservation)}
                                            className={styles.selectInput}
                                        >
                                            <option value="">고객 선택</option>
                                            {Array.isArray(customers) && customers.map(customer => (
                                                <option key={customer.userCode} value={customer.userCode.toString()}>
                                                    {customer.userName} ({customer.userPhone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {(isFromReservation && selectedReservation) && (
                                        <small className={styles.helperText}>예약 정보에서 자동 설정됨</small>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="menuCode">
                                        시술 <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            id="menuCode"
                                            name="menuCode"
                                            value={formData.menuCode}
                                            onChange={handleChange}
                                            disabled={loading || (isFromReservation && selectedReservation)}
                                            className={styles.selectInput}
                                        >
                                            <option value="">시술 선택</option>
                                            {Array.isArray(menus) && menus.map(menu => (
                                                <option key={menu.menuCode} value={menu.menuCode.toString()}>
                                                    {menu.menuName} ({menu.menuPrice.toLocaleString()}원)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {(isFromReservation && selectedReservation) && (
                                        <small className={styles.helperText}>예약 정보에서 자동 설정됨</small>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="resvDate">
                                        시술 날짜 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="resvDate"
                                        name="resvDate"
                                        value={formData.resvDate}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.textInput}
                                    />
                                    {(isFromReservation && selectedReservation) && (
                                        <small className={styles.helperText}>예약 정보에서 자동 설정됨 (수정 가능)</small>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="resvTime">
                                        시술 시간 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="resvTime"
                                        name="resvTime"
                                        value={formData.resvTime}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={styles.textInput}
                                    />
                                    {(isFromReservation && selectedReservation) && (
                                        <small className={styles.helperText}>예약 정보에서 자동 설정됨 (수정 가능)</small>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="payAmount">
                                        결제 금액 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="payAmount"
                                        name="payAmount"
                                        value={formData.payAmount}
                                        onChange={handleNumberChange}
                                        placeholder="결제 금액을 입력해 주세요."
                                        disabled={loading}
                                        className={styles.textInput}
                                    />
                                    {(isFromReservation && selectedReservation) && (
                                        <small className={styles.helperText}>시술 가격에서 자동 설정됨 (수정 가능)</small>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="payMethod">
                                        결제 방법 <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.selectWrapper}>
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
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="payStatus">
                                        결제 상태 <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.selectWrapper}>
                                        <select
                                            id="payStatus"
                                            name="payStatus"
                                            value={formData.payStatus}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={styles.selectInput}
                                        >
                                            <option value="COMPLETED">정상결제</option>
                                            <option value="PARTIAL_CANCELLED">부분취소</option>
                                            <option value="CANCELLED">전체취소</option>
                                        </select>
                                    </div>
                                </div>

                                {(formData.payStatus === 'CANCELLED' || formData.payStatus === 'PARTIAL_CANCELLED') && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="cancelAmount">
                                            취소 금액 <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="cancelAmount"
                                            name="cancelAmount"
                                            value={formData.payStatus === 'CANCELLED' ? formData.payAmount : formData.cancelAmount}
                                            onChange={handleNumberChange}
                                            placeholder="취소 금액을 입력해 주세요."
                                            disabled={loading || formData.payStatus === 'CANCELLED'}
                                            className={styles.textInput}
                                        />
                                        {formData.payStatus === 'CANCELLED' && (
                                            <small className={styles.helperText}>전체취소의 경우 자동으로 전액 취소됩니다.</small>
                                        )}
                                    </div>
                                )}
                            </div>

                            {(formData.payStatus === 'CANCELLED' || formData.payStatus === 'PARTIAL_CANCELLED') && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="cancelReason">
                                        취소 사유 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="cancelReason"
                                        name="cancelReason"
                                        value={formData.cancelReason}
                                        onChange={handleChange}
                                        placeholder="취소 사유를 입력해 주세요."
                                        disabled={loading}
                                        className={styles.textInput}
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="userComment">메모</label>
                                <textarea
                                    id="userComment"
                                    name="userComment"
                                    value={formData.userComment}
                                    onChange={handleChange}
                                    placeholder="시술 관련 메모를 입력해 주세요."
                                    disabled={loading}
                                    className={styles.textareaInput}
                                    rows={3}
                                />
                                {(isFromReservation && selectedReservation) && (
                                    <small className={styles.helperText}>예약 메모에서 자동 설정됨 (수정 가능)</small>
                                )}
                            </div>

                            {/* 최종 금액 표시 */}
                            <div className={styles.finalAmountSection}>
                                <div className={styles.finalAmountLabel}>최종 금액</div>
                                <div className={styles.finalAmountValue}>
                                    {getFinalAmount().toLocaleString()}원
                                </div>
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
                                disabled={loading || (!selectedReservation && !isEdit)}
                            >
                                {loading ? '처리 중...' : (
                                    selectedReservation ? '매출 등록 + 시술완료 처리' : 
                                    isEdit ? '수정' : '예약을 선택해주세요'
                                )}
                            </button>
                        </div>
                    </form>
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
                confirmText={modal.type === 'confirm' ? '삭제' : '확인'}
                cancelText="취소"
            />
        </>
    );
}