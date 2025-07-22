'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';

import 'react-datepicker/dist/react-datepicker.css';
import 'src/styles/admin/admin-shop/ShopHoliday.css';
import {formatDate} from "@/app/myshop/[shopCode]/holidays/util/dateUtils.js";

export default function HolidayForm({ mode, holiday, onSubmit, onClose, onShowAlert }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isRepeating, setIsRepeating] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && holiday) {
            setStartDate(new Date(holiday.holStartDate));
            setEndDate(holiday.holEndDate ? new Date(holiday.holEndDate) : null);
            setIsRepeating(holiday.isHolRepeat);
        } else {
            setStartDate(new Date());
            setEndDate(null);
            setIsRepeating(false);
        }
    }, [mode, holiday]);

    const handleRepeatChange = (e) => {
        const checked = e.target.checked;
        setIsRepeating(checked);
        if (checked) {
            setEndDate(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!startDate) {
            window.alert("시작 날짜를 선택해주세요.");
            return;
        }
        if (!isRepeating && !endDate) {
            window.alert("종료 날짜를 선택해주세요.");
            return;
        }

        const formData = {
            startDate: formatDate(startDate),
            endDate: isRepeating ? null : formatDate(endDate),
            isHolRepeat: isRepeating,
        };
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="form-modal-content">
                <h3>{mode === 'create' ? '새 휴일 등록' : '휴일 정보 수정'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={isRepeating} onChange={handleRepeatChange} />
                            매주 반복되는 정기 휴일인가요?
                        </label>
                    </div>

                    <div className="form-section">
                        <label>{isRepeating ? '휴일로 지정할 요일 선택' : '휴일 시작 날짜'}</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                            locale={ko}
                            // 새 휴일 등록 시 오늘 이후만 선택 가능
                            minDate={mode === 'create' ? new Date() : null}
                            className="date-picker-input-full"
                        />
                    </div>

                    {!isRepeating && (
                        <div className="form-section">
                            <label>휴일 종료 날짜</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="yyyy-MM-dd"
                                locale={ko}
                                minDate={startDate}
                                className="date-picker-input-full"
                            />
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="secondary-button" onClick={onClose}>취소</button>
                        <button type="submit" className="primary-button">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};