import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation/DetailReservationModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function DetailReservationModal({selectedResvCode, setIsShowDetailReservation}){
    const [detailResvInfo, sestDetailresvInfo] = useState({});
    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        const detailReservation = async() => {
            try {
                const res = await fetch(`${API_BASE_URL}/${selectedResvCode}`);
                const data = await res.json();
                sestDetailresvInfo(data);
            } catch (error) {
                console.error('예약 삳세 정보 불러오기 실패 :', error);
            }
        };
        detailReservation();
    },[])

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
    }, []);

    const formatTime = (resvTime) => {
        const [hours, minutes, seconds] = resvTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        return date.toLocaleTimeString('en-US', {hour: 'numeric', hour12: true});
    };

    const changeResvState = (resvState) => {
        switch(resvState){
            case "APPROVE" : return "예약 확정"; break;
            case "CANCEL" : return "예약 취소"; break;
            case "FINISH" : return "시술 완료"; break;
        }
    }

    return(
        <>  
            <div className={styles.modalOverlay}/>
            <div className={styles.modalWrapper}>
                <div className={styles.modalHeaderWrapper}>
                    <p className={styles.menuTitle}>예약 상세 정보</p>
                    <Image 
                        src={closeBtn} 
                        alt='닫기 버튼' 
                        onClick={() => setIsShowDetailReservation(false)}
                        className={styles.closeBtn}
                    /> 
                </div>
                <div className={styles.modalBodyWrapper}>
                    <p className={styles.bigTitle}>📅 예약 정보</p>
                    <div className={styles.resvInfoWrapper}>
                        <div className={styles.resvInfo}>
                            <div className={styles.valueRow}>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>예약일 :</p>&nbsp;
                                <p className={styles.values}>{detailResvInfo.resvDate}</p>
                                </div>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>시간 :</p>&nbsp;
                                <p className={styles.values}>{detailResvInfo.resvTime ? formatTime(detailResvInfo.resvTime) : ''}</p>
                                </div>
                            </div>
                            <div className={styles.valueRow}>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>고객명 :</p>&nbsp;
                                <p className={styles.values}>{detailResvInfo.userName}</p>
                                </div>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>연락처 :</p>&nbsp;
                                <p className={styles.values}>{detailResvInfo.userPhone}</p>
                                </div>
                            </div>
                            <div className={styles.valueRow}>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>메뉴 :</p>&nbsp;
                                <p className={styles.values}>{detailResvInfo.menuName}</p>
                                </div>
                                <div className={styles.valueSection}>
                                <p className={styles.titles}>상태 :</p>&nbsp;
                                <p className={styles.values}>{changeResvState(detailResvInfo.resvState)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className={`${styles.bigTitle} ${styles.memoTitle}`}>📝 요청사항</p>
                    <div className={`${styles.resvInfoWrapper} ${styles.userCommentWrapper}`}>
                        <p className={styles.userComment}>{detailResvInfo.userComment}</p>
                    </div>
                    <div className={styles.buttonsWrapper}>
                        <button className={styles.buttons}>예약 수정</button>
                        <button className={styles.buttons}>예약 취소</button>
                        <button className={styles.buttons}>메모 추가</button>
                    </div>
                </div>

            </div>
        </>
    )
}