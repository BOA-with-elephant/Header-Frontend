'use client';

import React from "react";
import {formatDate, formatTime} from 'src/app/shops/reservation/util/dateUtils';
import 'src/styles/user/shops/ReservationPage.css'

export default function ReservationList ({groupedReservations, onReservationSelect}) {
    // groupedReservations = 날짜별로 정리된 예약들
    // onReservationSelect = 예약을 클릭했을 때 요소 전달
    const sortedDates = Object.keys(groupedReservations)
        .sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        return <div className="no-reservations">예약 내역이 없습니다</div>
    }

    const getResvStateKorean = (state) => {
        const stateMap = {
            'CANCEL': '예약취소',
            'FINISH': '시술완료',
            'APPROVE': '예약확정'
        };
        return stateMap[state] || state;
    };

    return (
        <div className="reservation-list-container">
            {sortedDates.map(date => (
                <div className={'reservation-group'} key={date}>
                    <div className="reservation-group-header">
                        {formatDate(date)}
                    </div>
                    {groupedReservations[date].map(resv => (
                        <div
                            key={resv.resvCode}
                            className="reservation-item"
                            onClick={() => onReservationSelect(resv.resvCode)}
                            >
                            <div className = "item-details">
                                <div className="item-shop-name">{resv.shopName}</div>
                                <div className="item-info-line">
                                    {resv.shopLocation.split(' ')[0]} {resv.shopLocation.split(' ')[1]}
                                </div>
                                <div className="item-time-status">
                                    {formatTime(resv.resvTime)} ·
                                    <span>
                                        {getResvStateKorean(resv.resvState)}
                                    </span>
                                </div>
                                <div className="item-menu">{resv.menuName}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

