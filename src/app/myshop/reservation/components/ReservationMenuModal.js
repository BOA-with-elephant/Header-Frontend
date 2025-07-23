import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation/ReservationMenuModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function ReservationMenuModal({
    setIsShowModal, 
    selectedDate, 
    setSearchResultList, 
    setIsOpen, 
    setIsShowNewResvModal, 
    resvDateList,
    isPreventRegist,
    setIsPreventRegist,
    preventRegistDate,
    setPreventRegistDate
}){
    const [pastDay, setPastDay] = useState(false);
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/reservation`;
    
    // 예약 상세 조회
    const ShowDetailReservationHandler = async() => {
        setIsShowModal(false);
      
        try{
            const response = await fetch(`${API_BASE_URL}?resvDate=${selectedDate}`);
            const data = await response.json();
            setSearchResultList(data);
            setIsOpen(true);
            window.scrollTo({
                top : 0,
                behavior : 'smooth'
            })
        } catch (error) {
            console.error('검색 결과 불러오기 실패 : ', error)
        }
    }

    const ShowNewResvModalHandler = () => { 

        if(pastDay || isPreventRegist && preventRegistDate === selectedDate) return ; // 클릭 막기

        setIsShowModal(false);
        setIsShowNewResvModal(true);
    }

    useEffect(() => {

        // 오늘 이전 날짜 예약 등록 막기
        const formatSelectedDate = new Date(selectedDate);
        const today = new Date();
        // 시간 제거해서 날짜만 비교 (00:00:00 기준)
        formatSelectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (formatSelectedDate < today) {
            setPastDay(true);
        }

        // 예약 가능 날짜가 아니면 예약 등록 막기
        const availableDates = resvDateList?.results?.schedule?.map(item => item.targetDate) || [];
        const isAvailableDate = availableDates.includes(selectedDate);

        if(!isAvailableDate){
            setPastDay(true);
        }

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

    const PreventRegistHandler = () => {
        setIsPreventRegist(prev => !prev);
        setPreventRegistDate(selectedDate);
    }

    return(
        <>
            <div className={styles.modalOverlay}/>
            <div className={styles.modalWrapper}>
                <div className={styles.modalHeaderWrapper}>
                    <p className={styles.menuTitle}>예약 메뉴</p>
                    <Image 
                        src={closeBtn} 
                        alt='닫기 버튼' 
                        onClick={() => setIsShowModal(false)}
                        className={styles.closeBtn}
                    /> 
                </div>
                <div className={styles.modalBodyWrapper}>
                    <div className={`${styles.menus} ${pastDay ? styles.pastDay : ''} ${isPreventRegist && preventRegistDate === selectedDate? styles.preventRegist : ''}`} 
                        onClick={ShowNewResvModalHandler}
                    >
                        예약 등록
                    </div>
                    <div className={styles.menus} onClick={ShowDetailReservationHandler}>예약 조회</div>
                    <div className={styles.menus} onClick={PreventRegistHandler}>{ isPreventRegist && preventRegistDate === selectedDate ? '예약 풀기' : '예약 막기'}</div>
                </div>
            </div>
        </>
    )
}