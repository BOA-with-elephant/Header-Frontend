import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation/UpdateResvInfo.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';
import DatePicker from 'react-datepicker';
import {ko} from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

export default function UpdateReservationInfoModal({setIsShowUpdateModal, selectedResvCode, selectedDate, resvDateList, setIsShowDetailReservation, fetchReservationData}){
    const [reservationInfo, setReservationInfo] = useState({
        userName : '',
        userPhone : '',
        menuName : '',
        resvDate : selectedDate,
        resvTime : '',
        userComment : ''
    });
    const [menuNameList, setMenuNameList] = useState([]);
    const [dateAndTimeList, setDateAndTimeList] = useState({results: {schedule : []}});
    const includedDates = dateAndTimeList.results.schedule.map(item => {
        const date = new Date(item.targetDate);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
    const [pickedDate, setPickedDate] = useState(new Date());

    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        const fetchMenuList = async () => {
            try {
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/menu`);
            const data = await response.json();
            setMenuNameList(data);
            } catch (err) {
            setError(err.message);
            console.error('메뉴 리스트 조회 실패:', err);
            }
        }; 
        fetchMenuList();

        const fetchDateAndTime = async() => {
            try{
                const response = await fetch(`http://localhost:8080/shops/reservation/${SHOP_CODE}/resv-time-and-date`);
                const data = await response.json();
                setDateAndTimeList(data);
                // console.log('💥날짜와 시간 : ', data);
            } catch(error){
                console.error('가게 운영 날짜 및 시간 조회 실패 : ', error);
            }
        };
        fetchDateAndTime();

        const reservationInfo = async() => {
            try{
                const response = await fetch(`${API_BASE_URL}/${selectedResvCode}`);
                const data = await response.json();
                setReservationInfo({
                    ...data,
                    resvTime : data.resvTime
                });
                console.log('수정할 정보 : ', data);
            } catch(error) {
                console.error('수정할 정보 조회 실패 : ', error);
            }
        }
        reservationInfo();

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

    const inputChangeHandler = (e) => {
        const {name, value} = e.target;
        setReservationInfo(prev => ({
            ...prev,
            [name] : value
        }));
    };

    const clickCancleHandler = () => {
        setIsShowUpdateModal(false);
    }

    const clickSubmitHandler = async() => {
        const {resvDate, resvTime, menuName, userComment} = reservationInfo;

        const updatedInfo = {resvDate, resvTime, menuName, userComment};

        if(resvDate && resvTime && menuName){
            try{
                const response = await fetch(`${API_BASE_URL}/${selectedResvCode}`,{
                    method : 'PUT',
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify(updatedInfo)
                });

                const contentType = response.headers.get("Content-Type");

                if(contentType && contentType.includes("application/json")){
                    const data = await response.json();
                    console.log('예약 수정 성공 : ', data);
                    await fetchReservationData();
                    setIsShowUpdateModal(false); 
                    setIsShowDetailReservation(true);
                } else {
                    const text = await response.text();
                    console.warn("받은 응답이 JSON이 아님 : ", text);
                }
            } catch (error){
                console.error('예약 수정 실패 : ', error)
            }
        } else {
            console.warn('모든 필드를 입력해주세요.');
        }
    }   

    return(
        <>
            <div className={styles.modalOverlay} />
            <div className={styles.modalWrapper}>
                <div className={styles.modalHeaderWrapper}>
                <p className={styles.menuTitle}>예약 정보 수정</p>
                <Image
                    src={closeBtn}
                    alt='닫기 버튼'
                    onClick={() => setIsShowUpdateModal(false)}
                    className={styles.closeBtn}
                />
                </div>

                <div className={styles.modalBodyWrapper}>
                    <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                    <label>예약 날짜</label>
                    <DatePicker
                        locale={ko}
                        className={styles.inputTag}
                        calendarClassName={styles.custumCalendar}
                        popperClassName={styles.customPopper}                        
                        dateFormat='yyyy-MM-dd'  // 날짜 형태
                        shouldCloseOnSelect  // 날짜를 선택하면 datepicker가 자동으로 닫힘
                        selected={new Date(reservationInfo.resvDate)}
                        name='resvDate'
                        onChange={date => {
                            setPickedDate(date);
                            setReservationInfo(prev => ({
                                ...prev,
                                resvDate : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            }));
                        }}
                        includeDates={includedDates}
                    />
                    </div>

                    <div className={styles.formGroup}>
                    <label>예약 시간</label>
                    {reservationInfo.resvTime && (
                        <select 
                            className={styles.selector} 
                            name="resvTime" 
                            value={reservationInfo.resvTime} 
                            onChange={inputChangeHandler}
                        >
                            <option value="">시간 선택</option>
                            {dateAndTimeList?.results?.schedule
                            ?.filter(dateObj => dateObj.targetDate === selectedDate)
                            ?.flatMap(dateObj => {
                                const reservedSet = new Set(dateObj.reservedTimes);
                                const allTimes = Array.from(new Set([...dateObj.availableTimes, ...dateObj.reservedTimes])).sort();
                                return allTimes.map(time => ({
                                time,
                                reserved: reservedSet.has(time)
                                }));
                            })
                            ?.map(({ time, reserved }) => (
                                <option 
                                    key={time} 
                                    value={time} 
                                    disabled={reserved}
                                    style={{ color: reserved ? '#BDBEBF' : '#000000' }}
                                >
                                    {time.slice(0, 5)}{reserved ? ' (예약됨)' : ''}
                                </option>
                            ))}
                        </select>
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
                        value={reservationInfo.userName} 
                        disabled
                        style={{backgroundColor : '#f3f4f6'}}
                    />
                    </div>

                    <div className={styles.formGroup}>
                    <label>연락처</label>
                    <input 
                        className={styles.inputTag} 
                        type="tel" 
                        name="userPhone"
                        value={reservationInfo.userPhone} 
                        disabled
                        style={{backgroundColor : '#f3f4f6'}}
                    />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                    <label>예약 시술</label>
                    <select className={styles.selector} name="menuName" value={reservationInfo.menuName} onChange={inputChangeHandler}>
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
                        value={reservationInfo.userComment}
                        onChange={inputChangeHandler}
                    />
                    </div>
                </div>
                <div className={styles.buttonRow}>
                    <button onClick={clickCancleHandler} className={styles.cancelBtn}>취소</button>
                    <button onClick={clickSubmitHandler} className={styles.submitBtn}>수정</button>
                </div>
                </div>
            </div>
        </>
    )
}