import { useState, useEffect } from "react";
import styles from '../../../../styles/admin/reservation/NewReservationModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function NewReservationModal({ isShowNewResvModal, setIsShowNewResvModal }) {
  
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;
    
    const [reservationData, setReservationData] = useState({
        userName : '',
        userPhone : '',
        resvDate : '',
        resvTime : '',
        menuName : '',
        userComment : ''
    });  
    const [resvTimeList, setResvTimeList] = useState([]);
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
            console.error('카테고리 조회 실패:', err);
            }
        }; 
        fetchMenuList(); // 반드시 호출해야 함
    }, []);


    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const availableDay = `${year}-${month}-${day}`;

        setToday(availableDay);
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

    const clickSubmitHandler = () => {
        console.log('reservationData',reservationData)
    }

    //   // 서버 전송용 값
    //   const getFormattedPhoneForServer = () => {
    //     // 하이픈 없으면 추가 (혹은 다른 처리)
    //     return phone.replace(/[^0-9]/g, "") // 숫자만 추출
    //                 .replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"); // 하이픈 추가
    //   };

    // const handleSubmit = () => {
    //     // 여기에 예약 등록 API 호출 로직 추가
    //     console.log({ customer, phone, date, time, procedure, memo });
    //     setIsShowNewResvModal(false);
    //   };


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
                    type="date" value={reservationData.resvDate} 
                    onChange={inputChangeHandler}
                    min={today}
                />
                </div>

                <div className={styles.formGroup}>
                <label>예약 시간</label>
                <select className={styles.selector} name="resvTime" value={reservationData.resvTime} onChange={inputChangeHandler}>
                    <option value="">시간 선택</option>
                    <option value="10:00~11:00">10:00</option>
                    <option value="11:00~12:00">11:00</option>
                    <option value="12:00~13:00">12:00</option>
                    <option value="12:00~13:00">13:00</option>
                    <option value="12:00~13:00">14:00</option>
                    <option value="12:00~13:00">15:00</option>
                    <option value="12:00~13:00">16:00</option>
                    <option value="12:00~13:00">17:00</option>
                    <option value="12:00~13:00">18:00</option>
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
                    minLength={13}
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
