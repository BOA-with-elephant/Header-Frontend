import { useState, useEffect } from "react";
import styles from '../../../../styles/admin/reservation/NewReservationModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function NewReservationModal({ isShowNewResvModal, setIsShowNewResvModal, selectedDate, resvDateList, fetchReservationData }) {
  
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;
    
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

    useEffect(() => {
        const fetchMenuList = async () => {
            try {
            const response = await fetch(`http://localhost:8080/api/v1/myshop/${SHOP_CODE}/menu`);
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
        // \D는 숫자가 아니 모든 문자를 지운다는 뜻으로 입력값에서 숫자만 남기고, 하이픈같은 건 제거한다.
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
                    console.log('예약 성공 : ', data);
                    await fetchReservationData();
                    setIsShowNewResvModal(false); 
                } else {
                    const text = await response.text();
                    console.warn("받은 응답이 JSON이 아님 : ", text);
                }
            } catch(error){
                console.error('예약 실패 : ', error)
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
            <p className={styles.menuTitle}>예약 정보 등록</p>
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
                    name = "resvDate"
                    type="date"
                    disabled 
                    value={reservationData.resvDate} 
                />
                </div>

                <div className={styles.formGroup}>
                <label>예약 시간</label>
                <select className={styles.selector} name="resvTime" value={reservationData.resvTime} onChange={inputChangeHandler}>
                    <option value="">시간 선택</option>
                    {resvDateList?.results?.schedule
                    .filter(item => item.targetDate === selectedDate)  // selectedDate와 일치하는 날짜 찾기
                    .flatMap(item => {
                        // 오늘인 경우 현재 시간 이후로만 예약 가능
                        const isToday = new Date(item.targetDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
                        const currentTime = new Date();
                        const currentHours = currentTime.getHours();
                        const currentMinutes = currentTime.getMinutes();

                        return item.availableTimes.filter(time => {
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
                    ))}
                </select>
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
