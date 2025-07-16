'use client'; 
import { useState, useEffect } from "react";
import MessageModal from '@/components/ui/MessageModal';  // 성공, 실패, 경고, 확인 등의 메시지를 사용자에게 표시하는 공통 모달 컴포넌트
import { useMessageModal } from '@/hooks/useMessageModal'; // 메시지 모달 상태를 관리하고 제어하는 커스텀 훅
// showError, showSuccess, showConfirm, showWarning 등을 통해 상황별 메시지를 간편하게 호출 가능
import { MESSAGES } from '@/constants/messages'; // 애플리케이션 전반에서 사용하는 표준 메시지 텍스트 모음 (예: 에러 메시지, 안내 문구 등)
import styles from "src/styles/admin/reservation/ReservationManagement.module.css";
import Image from 'next/image';
import goBackButton from "public/images/reservation/Back.png";

export default function Reservation() {

    const [thisYear, setThisYear] = useState();
    const [thisMonth,  setThisMonth] = useState();

    useEffect(() => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        
        setThisYear(year + "년");
        switch(month){
            case 0 : setThisMonth("1월"); break;
            case 1 : setThisMonth("2월"); break;
            case 2 : setThisMonth("3월"); break;
            case 3 : setThisMonth("4월"); break;
            case 4 : setThisMonth("5월"); break;
            case 5 : setThisMonth("6월"); break;
            case 6 : setThisMonth("7월"); break;
            case 7 : setThisMonth("8월"); break;
            case 8 : setThisMonth("9월"); break;
            case 9 : setThisMonth("10월"); break;
            case 10 : setThisMonth("11월"); break;
            case 11 : setThisMonth("12월"); break;
        }
    })


    return (
        <>
            <h1>예약관리 페이지</h1>
            <div className="content-card">
                <div className={styles.calendarHeader}>
                    <span className={styles.title}>예약 관리</span>
                    <div className={styles.yearAndMonth}>
                        <Image src={goBackButton} alt='이전 달로 가기' className={styles.changeMonthBtn}/>
                        <span className={styles.yearAndMonthTitle} style={{ marginTop : '3px' }}>{thisYear} {thisMonth}</span>
                        <Image src={goBackButton} alt="다음 달로 가기" className={styles.changeMonthBtn} style={{ transform: 'scaleX(-1)' }}/>
                    </div>
                </div>
            </div>
        </>
    )
}