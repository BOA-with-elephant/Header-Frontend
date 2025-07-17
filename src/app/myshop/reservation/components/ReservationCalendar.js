import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import goBackButton from "public/images/reservation/Back.png";
import searchIcon from "../../../../../public/images/reservation/Magnifier.png";
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

export default function ReservationCalendar({setSearchResultList, setIsOpen}) {
    const [selectedDate, setSelectedDate] = useState(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const dayList = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    const [day, setDay] = useState(currentDate.getDay());

    const [inputValue, setInputValue] = useState("");
    const [optionValue, setOptionValue] = useState("byDate");

    const [reservationInfo, setReservationInfo] = useState([]);
    // const [searchResultList, setSearchResultList] = useState([]);
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

    const optionValueChangeHandler = (e) => {
        setOptionValue(e.target.value);
    }

    const inputEventHandler = async () => {
        switch(optionValue){
            case "byDate" : 
                try{
                    const formattedResvDate = `${inputValue.slice(0, 4)}-${inputValue.slice(4, 6)}-${inputValue.slice(6, 8)}`;
                    const response = await fetch(`${API_BASE_URL}?resvDate=${formattedResvDate}`);
                    const data = await response.json();
                    console.log('listByDate', data);
                    setSearchResultList(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error('검색 결과 불러오기 실패 : ', error)
                }
                break;
            case "byUserName" : 
                try{
                    const response = await fetch(`${API_BASE_URL}?userName=${inputValue}`);
                    const data = await response.json();
                    console.log('listByUserName', data);
                    setSearchResultList(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error('검색 결과 불러오기 실패 : ', error)
                }
                break;
            case "byMenuName" : 
                try{
                    const response = await fetch(`${API_BASE_URL}?menuName=${inputValue}`);
                    const data = await response.json();
                    console.log('listByMenuName', data);
                    setSearchResultList(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error('검색 결과 불러오기 실패 : ', error)
                }
                break;
        }
    }

    useEffect(() => {
        const reservationList = async () => {
            try {
                const formatMonth = String(month + 1).padStart(2, '0');
                const thisMonth = `${year}-${formatMonth}`;
                console.log('thisMonth', typeof(thisMonth));
                const res = await fetch(`${API_BASE_URL}/${thisMonth}`);
                const data = await res.json();
                console.log('data', data);
                setReservationInfo(data);
            } catch (error) {
                console.error('예약 정보 불러오기 실패 :', error);
            }
        };
        reservationList();
    }, [year, month]);

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
                        <input type="text" className={styles.inputBox} onChange={(e) => setInputValue(e.target.value)}/>
                        <Image src={searchIcon} alt='검색 아이콘' className={styles.searchIcon} onClick={inputEventHandler}/>
                    </div>
                    <div className={styles.selectWrapper}>
                        <select name="searchTitle" className={styles.selectBox} style={{ paddingRight: '10px' }} onChange={optionValueChangeHandler}>
                            <option value="byDate">날짜별</option>
                            <option value="byUserName">고객별</option>
                            <option value="byMenuName">시술별</option>
                        </select>
                    </div>
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
                                
                                {(() => {
                                    function formatDateToYML(date){
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`
                                    }
                                    const dailyReservations = reservationInfo.filter(list => list.resvDate === formatDateToYML(date));

                                    const showReservations = dailyReservations.slice(0, 2);
                                    const hiddenCount = dailyReservations.length - 2;

                                    return(
                                        <>
                                            {showReservations.map(list => {
                                                const backgroundColor = list.menuColor;
                                                const resvTime = list.resvTime;

                                                function formatTime(resvTime){
                                                    const [hours, minutes, seconds] = resvTime.split(':');
                                                    const date = new Date();
                                                    date.setHours(parseInt(hours, 10));
                                                    return date.toLocaleTimeString('en-US', {hour: 'numeric', hour12: true});
                                                }

                                                const formattedTime = formatTime(resvTime);

                                                return(
                                                    <div key={list.resvCode} className={styles.resvDiv} style={{ backgroundColor : backgroundColor}}>
                                                        {formattedTime}&emsp;{list.userName}&emsp;{list.menuName}
                                                    </div>
                                                );
                                            })}
                                            {hiddenCount > 0 && (
                                                <div className={styles.resvDiv} style={{ backgroundColor : '#8588A2', color: '#FFFFFF'}}>
                                                    외 {hiddenCount}건
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};