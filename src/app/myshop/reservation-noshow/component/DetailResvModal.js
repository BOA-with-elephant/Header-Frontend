import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation-noshow/DetailResvModal.module.css';
import Image from 'next/image';
import closeBtn from '../../../../../public/images/reservation/whiteCloseBtn.png';

export default function DetailResvModal({
    selectedResvCode, 
    setIsShowDetailReservation, 
    setIsShowRealDeleteModal, 
    onlyNoShowList,
    setIsShowMessageModal,
    setResultTitle,
    setResultMessage,
    setResultType,
    onDeleteSuccess,
    setMessageContext,
    userInfo
}){
    const [detailResvInfo, sestDetailresvInfo] = useState({});
    const SHOP_CODE = userInfo.shopCode;
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        const detailReservation = async() => {
            try {
                const res = await fetch(`${API_BASE_URL}/${selectedResvCode}`,{
                    method : 'GET',
                    headers : {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type" : "application/json"
                    },
                });
                const data = await res.json();
                sestDetailresvInfo(data);
            } catch (error) {
                console.error('예약 상세 정보 불러오기 실패 :', error);
            }
        };
        detailReservation();

    },[selectedResvCode]);

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

    const showRealDeleteModalHandler = () => {
        setIsShowRealDeleteModal(true);
        setIsShowDetailReservation(false);
    }

    // '노쇼 처리' 버튼을 표시할지 여부를 결정하는 로직
    const isNoShow = onlyNoShowList.some((item) => item.resvCode === selectedResvCode);

    const noShowHandler = async() => {

        try{
            const response = await fetch(`${API_BASE_URL}/noshow/${selectedResvCode}`, {
                method : "PUT",
                headers : {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({})
            });

            const contentType = response.headers.get("Content-Type");

            if(contentType && contentType.includes("application/json")){
                const data = await response.json();
                console.log('노쇼 처리 성공 : ', data);
                
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
                setIsShowDetailReservation(false);
                setResultType('success');
                setResultTitle('노쇼 처리 성공');
                setResultMessage('노쇼 처리가 성공적으로 처리되었습니다.')
                setMessageContext('noshow');
                setIsShowMessageModal(true);
            } else {
                const text = await response.text();
                console.warn("받은 응답이 JSON이 아님 : ", text);
            }
        } catch(error) {
            console.error('노쇼 처리 실패 :', error);
            setResultType('error');
            setResultTitle('노쇼 처리 실패');
            setResultMessage('노쇼 처리를 실패하였습니다.')
            setTimeout(() => {
                setIsShowMessageModal(true);
            }, 100);
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
                    <div className={styles.valueRow}>
                        <p className={styles.bigTitle}>📅 예약 정보</p>
                    </div>
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
                        {isNoShow && (
                            <button className={styles.buttons} onClick={noShowHandler}>노쇼 처리</button>
                        )}
                        <button className={styles.buttons} onClick={showRealDeleteModalHandler}>예약 삭제</button>
                    </div>
                </div>
            </div>
        </>
    )
}