import { useState, useEffect } from "react";
import styles from '../../../../styles/admin/reservation/NewReservationModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function NewReservationModal({ 
    isShowNewResvModal, 
    setIsShowNewResvModal, 
    selectedDate, 
    resvDateList, 
    fetchReservationData, 
    setIsShowMessageModal,
    setResultTitle,
    setResultMessage,
    setResultType,
    setMessageContext,
    prefilledCustomer = null // 고객 관리에서 전달받는 고객 정보
}) {
  
    const SHOP_CODE = 1;
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;
    // const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/reservation`;
    
    const [reservationData, setReservationData] = useState({
        userName : prefilledCustomer?.name || '',
        userPhone : prefilledCustomer?.phone || '',
        menuName : '',
        resvDate : selectedDate || new Date().toISOString().split('T')[0],
        resvTime : '',
        userComment : ''
    });  
    const [menuNameList, setMenuNameList] = useState([]);
    const [today, setToday] = useState();

    // 고객이 미리 선택된 경우인지 확인
    const isCustomerPreselected = !!prefilledCustomer;

    useEffect(() => {
        const fetchMenuList = async () => {
            try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/menu`);
            // const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/menu`);
            const data = await response.json();
            setMenuNameList(data);
            } catch (err) {
            setError(err.message);
            console.error('메뉴 리스트 조회 실패:', err);
            }
        }; 
        fetchMenuList();
    }, []);

    useEffect(() => {
        // 고객 정보가 미리 선택된 경우 예약 데이터에 반영
        if (prefilledCustomer) {
            setReservationData(prev => ({
                ...prev,
                userName: prefilledCustomer.name || '',
                userPhone: prefilledCustomer.phone || ''
            }));
        }
    }, [prefilledCustomer]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const availableDay = `${year}-${month}-${day}`;

        setToday(availableDay);

        // 스크롤 막기
        document.body.style.overflow = 'hidden';  
        document.documentElement.style.overflow = 'hidden';

        const next = document.getElementById('__next');
        if (next) next.style.overflow = 'hidden';

        return () => {
            // 모달 닫힐 때 스크롤 원상 복구
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            if (next) next.style.overflow = 'auto';
        };
    }, []);

    // 숫자만 받아서 자동 포맷
    const phoneFormatHandler = (e) => {
        const {name, value} = e.target;
        // \D는 숫자가 아닌 모든 문자를 지운다는 뜻으로 입력값에서 숫자만 남기고, 하이픈같은 건 제거한다.
        let numbersOnly = value.replace(/\D/g, ""); // 숫자만 추출
        let formatted = '';

        if(numbersOnly.length <= 3){
            formatted = numbersOnly;
        } else if(numbersOnly.length <= 7){
            formatted = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
        } else {
            formatted = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
        }

        setReservationData(prev => ({
            ...prev,
            [name] : formatted
        }));
    };

    const inputChangeHandler = (e) => {
        const {name, value} = e.target;
        setReservationData(prev => ({
            ...prev,
            [name] : value
        }));

        // 날짜가 변경되면 시간 초기화
        if (name === 'resvDate') {
            setReservationData(prev => ({
                ...prev,
                [name]: value,
                resvTime: '' // 시간 초기화
            }));
        }
    };

    const clickCancleHandler = () => {
        setIsShowNewResvModal(false);
    }

    const clickSubmitHandler = async() => {
        const {resvDate, resvTime, userName, userPhone, menuName} = reservationData;

        if(resvDate && resvTime && userName && userPhone && menuName){
            try{
                const response = await fetch(`${API_BASE_URL}`, {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify(reservationData)
                });

                const contentType = response.headers.get("Content-Type");

                if(contentType && contentType.includes("application/json")){
                    const data = await response.json();
                    console.log('예약 성공 (?) : ', data);
                    await fetchReservationData();
                    setResultType('success');
                    setResultTitle('예약 등록 성공');
                    setResultMessage('예약이 성공적으로 등록되었습니다.');
                    setMessageContext('register');
                    setIsShowMessageModal(true);
                    setTimeout(() => {
                        setIsShowNewResvModal(false);
                    }, 0);
                } else {
                    const text = await response.text();
                    console.warn("받은 응답이 JSON이 아님 : ", text);
                }
            } catch(error){
                console.error('예약 실패 : ', error);
                await fetchReservationData();
                setIsShowNewResvModal(false);
                setResultType('error');
                setResultTitle('예약 등록 실패');
                setResultMessage('예약 등록에 실패했습니다.')
                setTimeout(() => {
                    setIsShowMessageModal(true);
                }, 100);
            }
        } else {
            console.warn('모든 필드를 입력해주세요');
        }
    }

    return (
        <>
        <div className={styles.modalOverlay} />
        <div className={styles.modalWrapper}>
            <div className={styles.modalHeaderWrapper}>
            <p className={styles.menuTitle}>
                {isCustomerPreselected ? `${prefilledCustomer.name}님 예약 등록` : '예약 정보 등록'}
            </p>
            <Image
                src={closeBtn}
                alt='닫기 버튼'
                onClick={() => setIsShowNewResvModal(false)}
                className={styles.closeBtn}
            />
            </div>

            <div className={styles.modalBodyWrapper}>
                <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label>예약 날짜</label>
                <input 
                    className={styles.inputTag} 
                    name="resvDate"
                    type="date"
                    min={today} // 오늘 이전 날짜 선택 불가
                    value={reservationData.resvDate} 
                    onChange={inputChangeHandler}
                    // 고객 관리에서 온 경우 날짜 선택 가능, 예약 캘린더에서 온 경우 비활성화
                    disabled={!isCustomerPreselected}
                />
                </div>

                <div className={styles.formGroup}>
                <label>예약 시간</label>
                <select className={styles.selector} name="resvTime" value={reservationData.resvTime} onChange={inputChangeHandler}>
                    <option value="">시간 선택</option>
                    {/* 예약 가능 시간 표시 로직 개선 */}
                    {resvDateList?.results?.schedule ? (
                        resvDateList.results.schedule
                        .filter(item => item.targetDate === reservationData.resvDate)
                        .flatMap(item => {
                            const isToday = new Date(item.targetDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
                            const currentTime = new Date();
                            const currentHours = currentTime.getHours();
                            const currentMinutes = currentTime.getMinutes();

                            return (item.availableTimes || []).filter(time => {
                                if(!isToday) return true;

                                const [hourStr, minuteStr] = time.split(':');
                                const hour = parseInt(hourStr);
                                const minute = parseInt(minuteStr);

                                return hour > currentHours || (hour === currentHours && minute > currentMinutes);
                            });
                        })
                        .map((time, index) => (
                            <option key={index} value={time}>
                                {time.substring(0, 5)}
                            </option>
                        ))
                    ) : (
                        // 임시 시간 옵션 (데이터가 없을 때)
                        Array.from({length: 10}, (_, i) => {
                            const hour = 9 + i;
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                            return (
                                <option key={i} value={timeStr}>
                                    {timeStr}
                                </option>
                            );
                        })
                    )}
                </select>
                {/* 디버깅용 - 나중에 제거 */}
                {process.env.NODE_ENV === 'development' && (
                    <small style={{color: '#666', fontSize: '12px'}}>
                        예약 데이터 상태: {resvDateList?.results ? '로드됨' : '로드 중...'}
                    </small>
                )}
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label>고객명</label>
                <input 
                    className={styles.inputTag} 
                    type="text" 
                    name="userName"
                    placeholder="고객명"
                    value={reservationData.userName} 
                    onChange={inputChangeHandler}
                    // 고객이 미리 선택된 경우 비활성화
                    disabled={isCustomerPreselected}
                    style={isCustomerPreselected ? { backgroundColor: '#f5f5f5', color: '#666' } : {}}
                />
                </div>

                <div className={styles.formGroup}>
                <label>연락처</label>
                <input 
                    className={styles.inputTag} 
                    type="tel" 
                    name="userPhone"
                    maxLength={13}
                    placeholder="휴대폰 번호"
                    value={reservationData.userPhone} 
                    onChange={phoneFormatHandler}
                    // 고객이 미리 선택된 경우 비활성화
                    disabled={isCustomerPreselected}
                    style={isCustomerPreselected ? { backgroundColor: '#f5f5f5', color: '#666' } : {}}
                />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label>예약 시술</label>
                <select className={styles.selector} name="menuName" value={reservationData.menuName} onChange={inputChangeHandler}>
                    <option value="">메뉴 선택</option>
                    {menuNameList.map(menu => (
                        <option key={menu.menuCode} value={menu.menuName}>{menu.menuName}</option>
                    ))}
                </select>
                </div>

                <div className={styles.formGroup}>
                <label>메모</label>
                <textarea
                    className={styles.textAreaTag}
                    name="userComment"
                    placeholder="참고 사항 및 메모"
                    value={reservationData.userComment}
                    onChange={inputChangeHandler}
                />
                </div>
            </div>

            {/* 고객 정보가 미리 선택된 경우 안내 메시지 */}
            {isCustomerPreselected && (
                <div className={styles.customerInfoNotice}>
                    <span className={styles.noticeIcon}>ℹ️</span>
                    <span className={styles.noticeText}>
                        고객 정보가 자동으로 입력되었습니다. 날짜와 시간을 선택해주세요.
                    </span>
                </div>
            )}

            <div className={styles.buttonRow}>
                <button onClick={clickCancleHandler} className={styles.cancelBtn}>취소</button>
                <button onClick={clickSubmitHandler} className={styles.submitBtn}>등록</button>
            </div>
            </div>
        </div>
        </>
    );
}