import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation/ReservationMenuModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function ReservationMenuModal({setIsShowModal ,selectedDate, setSearchResultList, setIsOpen, setIsShowUpdateModal}){
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;
    
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

    useEffect(() => {
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
        }, [])
    
        const showUpdateReservationModalHandler = () => {
            setIsShowUpdateModal(true);
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
                    <div className={styles.menus}>예약 등록</div>
                    <div className={styles.menus} onClick={ShowDetailReservationHandler}>예약 조회</div>
                    <div className={styles.menus} onClick={showUpdateReservationModalHandler}>예약 막기</div>
                </div>
            </div>
        </>
    )
}