import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/admin/reservation-noshow/CanceledAndNoShowList.module.css';
import Pagination from '@/components/ui/AdvancedPagination';

export default function CanceledAndNoShowList({
    canceledAndNoShowList,
    setIsShowDetailReservation,
    setSelectedResvCode
}){
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(canceledAndNoShowList.length/itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = canceledAndNoShowList.slice(startIndex, startIndex + itemsPerPage);
    const totalItems = canceledAndNoShowList.length;
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const handlePageSizeChange = (newSize) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    }
    
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

    return(
        <>
            <div className={styles.tableContainer}>
                <div style={{ paddingBottom : '20px'}}>
                    <h3 className={styles.heading}>예약 취소 및 노쇼 내역</h3>
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
                        {currentData.length > 0 ? (
                            currentData.map((list) => (
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    showPageSizeSelector={true}
                    showFirstLast={true}
                />
            </div>
        </>
    )
}