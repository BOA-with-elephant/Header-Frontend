'use client';

import {formatDate} from "@/app/myshop/[shopCode]/holidays/util/dateUtils.js";

import 'src/styles/admin/admin-shop/ShopHoliday.css';

export default function HolidayList ({ holidays, loading, onEdit, onDelete }) {
    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (holidays.length === 0) {
        return <p className="no-holidays">등록된 휴일 정보가 없습니다.</p>;
    }

    return (
        <div className="holiday-list">
            {holidays.map(hol => (
                <div key={hol.shopHolCode} className="holiday-item">
                    <div className="holiday-info">
                        <span className={`tag ${hol.isHolRepeat ? 'repeat' : 'temporary'}`}>
                            {hol.isHolRepeat ? '정기 휴일' : '임시 휴일'}
                        </span>
                        <span className="holiday-date">
                            {hol.isHolRepeat
                                ? `매주 ${new Date(hol.holStartDate).toLocaleDateString('ko-KR', { weekday: 'long', timeZone: 'UTC' })}`
                                : `${formatDate(hol.holStartDate)} ~ ${formatDate(hol.holEndDate)}`}
                        </span>
                    </div>
                    <div className="holiday-actions">
                        <button onClick={() => onEdit(hol)}>수정</button>
                        <button className={'danger'} onClick={() => onDelete(hol.shopHolCode)}>삭제</button>
                    </div>
                </div>
            ))}
        </div>
    );
};