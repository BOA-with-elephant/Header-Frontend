import { useState, useEffect } from "react";
import styles from '../../../../styles/admin/reservation/NewReservationModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function NewReservationModal({ 
    isShowNewResvModal, 
    setIsShowNewResvModal, 
    selectedDate, 
    selectedCustomer, 
    resvDateList, 
    fetchReservationData, 
    setIsShowMessageModal,
    setResultTitle,
    setResultMessage,
    setResultType,
    setMessageContext
}) {
  
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/reservation`;
    
    const [reservationData, setReservationData] = useState({
        userName : '',
        userPhone : '',
        menuName : '',
        resvDate : selectedDate,
        resvTime : '',
        userComment : ''
    });  
    const [menuNameList, setMenuNameList] = useState([]);
    const [today, setToday] = useState();


    // 고객 정보가 있을 때 예약 데이터에 미리 채우기
    useEffect(() => {
        if (selectedCustomer) {
            setReservationData(prev => ({
                ...prev,
                userName: selectedCustomer.name || '',
                userPhone: selectedCustomer.phone || ''
            }));
        }
    }, [selectedCustomer]);

    useEffect(() => {
        const fetchMenuList = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/menu`);
                const data = await response.json();
                setMenuNameList(data);
            } catch (err) {
                console.error('메뉴 리스트 조회 실패:', err);
            }
        }; 
        fetchMenuList();
    }, []);

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

    // 예약 가능 시간 추출 함수 (다양한 데이터 구조 대응)
    const getAvailableTimes = () => {
        console.log('=== getAvailableTimes 함수 실행 ===');
        
        if (!resvDateList) {
            console.log('resvDateList가 없습니다');
            return [];
        }

        let scheduleData = null;

        // 다양한 데이터 구조 케이스 처리
        if (resvDateList.results?.schedule) {
            scheduleData = resvDateList.results.schedule;
            console.log('Case 1: resvDateList.results.schedule 사용');
        } else if (resvDateList.data?.schedule) {
            scheduleData = resvDateList.data.schedule;
            console.log('Case 2: resvDateList.data.schedule 사용');
        } else if (resvDateList.schedule) {
            scheduleData = resvDateList.schedule;
            console.log('Case 3: resvDateList.schedule 사용');
        } else if (Array.isArray(resvDateList)) {
            scheduleData = resvDateList;
            console.log('Case 4: resvDateList 자체가 배열');
        } else {
            console.log('알 수 없는 데이터 구조:', resvDateList);
            return [];
        }

        console.log('scheduleData:', scheduleData);

        if (!Array.isArray(scheduleData)) {
            console.log('scheduleData가 배열이 아닙니다');
            return [];
        }

        // 선택된 날짜와 일치하는 스케줄 찾기
        const todaySchedule = scheduleData.find(item => {
            console.log('비교:', item.targetDate, '===', reservationData.resvDate);
            return item.targetDate === reservationData.resvDate; // selectedDate 대신 reservationData.resvDate 사용
        });

        console.log('todaySchedule:', todaySchedule);

        if (!todaySchedule || !todaySchedule.availableTimes) {
            console.log('해당 날짜의 스케줄이 없거나 availableTimes가 없습니다');
            return [];
        }

        // 오늘인 경우 현재 시간 이후로만 예약 가능
        const isToday = new Date(reservationData.resvDate).toDateString() === new Date().toDateString();
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();

        console.log('isToday:', isToday);
        console.log('currentHours:', currentHours, 'currentMinutes:', currentMinutes);

        let availableTimes = todaySchedule.availableTimes;

        if (isToday) {
            availableTimes = availableTimes.filter(time => {
                const [hourStr, minuteStr] = time.split(':');
                const hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);

                return hour > currentHours || (hour === currentHours && minute > currentMinutes);
            });
        }

        console.log('최종 availableTimes:', availableTimes);
        return availableTimes;
    };

    // 숫자만 받아서 자동 포맷
    const phoneFormatHandler = (e) => {
        const {name, value} = e.target;
        let numbersOnly = value.replace(/\D/g, "");
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
                    console.log('예약 성공:', data);
                    await fetchReservationData();
                    setResultType('success');
                    setResultTitle('예약 등록 성공');
                    setResultMessage(`${selectedCustomer?.name || reservationData.userName}님의 예약이 성공적으로 등록되었습니다.`);
                    setMessageContext('register');
                    setIsShowMessageModal(true);
                    setTimeout(() => {
                        setIsShowNewResvModal(false);
                    }, 0);
                } else {
                    const text = await response.text();
                    console.warn("받은 응답이 JSON이 아님:", text);
                }
            } catch(error){
                console.error('예약 실패:', error);
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
            alert('모든 필드를 입력해주세요.');
        }
    }

    const availableTimes = getAvailableTimes();

    // 날짜가 변경될 때 시간 선택 초기화
    useEffect(() => {
        setReservationData(prev => ({
            ...prev,
            resvTime: '' // 날짜 변경 시 시간 초기화
        }));
    }, [reservationData.resvDate]);

    return (
        <>
        <div className={styles.modalOverlay} />
        <div className={styles.modalWrapper}>
            <div className={styles.modalHeaderWrapper}>
                <p className={styles.menuTitle}>예약 정보 등록</p>
                {selectedCustomer && (
                    <p className={styles.customerInfo}>
                        고객: {selectedCustomer.name} ({selectedCustomer.phone})
                    </p>
                )}
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
                            min={today} // 오늘 이후 날짜만 선택 가능
                            value={reservationData.resvDate} 
                            onChange={inputChangeHandler}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>예약 시간</label>
                        <select 
                            className={styles.selector} 
                            name="resvTime" 
                            value={reservationData.resvTime} 
                            onChange={inputChangeHandler}
                        >
                            <option value="">시간 선택</option>
                            {availableTimes.length > 0 ? (
                                availableTimes.map((time, index) => (
                                    <option key={index} value={time}>
                                        {typeof time === 'string' ? time.substring(0, 5) : time}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>예약 가능한 시간이 없습니다</option>
                            )}
                        </select>
                        {/* 디버깅 정보 표시 */}
                        <small style={{color: '#666', fontSize: '12px'}}>
                            사용 가능한 시간: {availableTimes.length}개
                        </small>
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
                            disabled={!!selectedCustomer}
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
                            disabled={!!selectedCustomer}
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>예약 시술</label>
                        <select className={styles.selector} name="menuName" value={reservationData.menuName} onChange={inputChangeHandler}>
                            <option value="none">메뉴 선택</option>
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
                
                <div className={styles.buttonRow}>
                    <button onClick={clickCancleHandler} className={styles.cancelBtn}>취소</button>
                    <button onClick={clickSubmitHandler} className={styles.submitBtn}>등록</button>
                </div>
            </div>
        </div>
        </>
    );
}