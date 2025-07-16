import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import goBackButton from "public/images/reservation/Back.png";
import searchIcon from "../../../../../public/images/reservation/search_icon.png";
import styles from "../../../../styles/admin/reservation/Calendar.module.css";

// 현재 월, 이전 월, 다음 월 날짜를 계산하는 함수
const getCalendarDates = (year, month) => {

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(1 - firstDayOfMonth.getDay());

    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    const dates = [];
    let currentDate = new Date(startDay);

    while (currentDate <= endDay) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;  // 날짜 배열을 반환
};

export default function ReservationCalendar() {
    const [selectedDate, setSelectedDate] = useState(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const dayList = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    const [day, setDay] = useState(currentDate.getDay());

    const [reservationInfo, setReservationInfo] = useState([]);
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;
      
    useEffect(() => {
        switch(day){
            case 0:
                setDay("SUN");
                break;
            case 1:
                setDay("MON");
                break;
            case 2:
                setDay("TUE");
                break;
            case 3:
                setDay("WED");
                break;
            case 4:
                setDay("THU");
                break;
            case 5:
                setDay("FRI");
                break;
            case 6:
                setDay("SAT");
                break;
            default :
                break;
        }
    }, [day]);

    const calendarDates = getCalendarDates(year, month);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const selectedDateHandler = () => {
        setSelectedDate(date);
    }

    useEffect(() => {
        const reservationList = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/${year}/${month + 1}`);
                const data = await res.json();
                console.log(data);
                setReservationInfo(data);
            } catch (err) {
                console.error('예약 정보 불러오기 실패:', err);
            }
        };
        reservationList(); // 함수를 선언만 하지 말고 호출도 해야 함!
    }, [year, month]); // 이 값들이 바뀔 때마다 다시 호출됨


    return (
        <>
            <div className={styles.calendarHeader}>
                <div className={styles.leftSection}>
                    <span className={styles.title}>예약 관리</span>
                </div>
                <div className={styles.centerSection}>
                    <Image src={goBackButton} className={styles.changeMonthBtn} alt='전 월로 가기' onClick={handlePrevMonth} />
                    <p className={styles.yearAndMonth}>{year}년 &ensp;{month + 1}월</p>
                    <Image src={goBackButton} className={styles.changeMonthBtn} alt='다음 월로 가기' onClick={handleNextMonth} style={{ transform: 'scaleX(-1)' }}/>
                </div>
                <div className={styles.rightSection}>
                    <div className={styles.inputWrapper}>
                        <input type="text" className={styles.inputBox}/>
                        <Image src={searchIcon} alt='검색 아이콘' className={styles.searchIcon}/>
                    </div>
                    <select name="searchTitle" className={styles.selectBox}>
                        <option>날짜별</option>
                        <option>고객별</option>
                        <option>시술별</option>
                    </select>
                </div>
            </div>
            <div className={styles.calendarBody}>
                <div className={styles.dayList}>
                    {dayList.map((day, index) => (
                        <span key={index} className={styles.day}>{day}</span>
                    ))}
                </div>
                <div className={styles.calendarGrid}>
                    {calendarDates.map((date, index) => {

                        // 오늘 날짜를 비교하기 위해 시간 값을 0으로 설정
                        const todayWithoutTime = new Date(today).setHours(0, 0, 0, 0);
                        const dateWithoutTime = new Date(date).setHours(0, 0, 0, 0);
                        const nextWeekWithoutTime = new Date(today);
                        nextWeekWithoutTime.setDate(today.getDate() + 7);

                        const isToday = date.toDateString() === today.toDateString();
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        const isPastDate = dateWithoutTime < todayWithoutTime; // 오늘 이전 날짜 확인
                        const isBeyondNextWeek = dateWithoutTime > nextWeekWithoutTime;  // 다음 주 이후 날짜 확인

                        const isWithinOneWeek = !isPastDate && !isBeyondNextWeek;

                        return(
                            <div
                                key={index}
                                className={`${styles.dateCell} ${
                                    date.getMonth() === month ? styles.currentMonth : styles.otherMonth
                                }`}
                                onClick={isWithinOneWeek ? () => { selectedDateHandler(date) } : undefined}
                            >
                                {date.getDate()}

                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};