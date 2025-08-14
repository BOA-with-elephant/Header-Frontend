import React, {useState, useEffect} from 'react';
import styles from '../../../../styles/admin/reservation-noshow/OnlyNoShowList.module.css';

export default function OnlyNoShowList({
    onlyNoShowList,
    setIsShowDetailReservation,
    setSelectedResvCode,
    setIsShowMessageModal,
    setResultTitle,
    setResultMessage,
    setResultType,
    onDeleteSuccess,
    setMessageContext
}){
    const SHOP_CODE = 1;
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;
    // const API_BASE_URL = `http://localhost:8080/api/v1/my-shops/${SHOP_CODE}/reservation`;
 
    const formatTime = (resvTime) => {
        const [hours, minutes, seconds] = resvTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        return date.toLocaleTimeString('en-US', {hour: 'numeric', hour12: true});
    };

    const changeResvState = (resvState, userComment) => {
        switch(resvState){
            case "APPROVE" : return "예약 확정"; break;
            case "CANCEL" : return userComment === '노쇼' ? "노쇼" : "예약 취소"; break;
            case "FINISH" : return "시술 완료"; break;
        }
    }

    const showDetailResvHandler = (resvCode) => {
        setIsShowDetailReservation(true);
        setSelectedResvCode(resvCode);
    }

    const bulkNoShowHandler = async() => {
        const resvCodes = onlyNoShowList.map(item => item.resvCode);

        try{
            const response = await fetch(`${API_BASE_URL}/noshow-bulk`,{
                method : "PUT",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({resvCodes})
            });

            const contentType = response.headers.get("Content-Type");

            if(contentType && contentType.includes("application/json")){
                const data = await response.json();
                console.log('일괄 노쇼 처리 성공 : ', data);
                
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }

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
            <div className={styles.tableContainer}>
                <div style={{ paddingBottom : '20px'}}>
                    <div className={styles.headerRow}>
                        <h3 className={styles.heading}>노쇼 내역</h3>
                        <button className={styles.button} onClick={bulkNoShowHandler}>일괄 노쇼 처리</button>
                    </div>
                </div>
                <table className={styles.customTable}>
                    <thead>
                        <tr>
                            <th>예약일</th>
                            <th>시간</th>
                            <th>고객명</th>
                            <th>시술</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {onlyNoShowList.length > 0 ? (
                            onlyNoShowList.map((list) => (
                                <tr
                                    key={list.resvCode}
                                    onClick={() => showDetailResvHandler(list.resvCode)}
                                >
                                    <td>{list.resvDate}</td>
                                    <td>{formatTime(list.resvTime)}</td>
                                    <td>{list.userName}</td>
                                    <td>{list.menuName}</td>
                                    <td>{changeResvState(list.resvState, list.userComment)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.noResult}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )} 
                    </tbody>
                </table>
            </div>
        </>
    )
}