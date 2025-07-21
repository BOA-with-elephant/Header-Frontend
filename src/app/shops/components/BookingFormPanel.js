'use client';
import {useState, useEffect, useCallback} from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

import Accordion from './Accordion';
import ShopAlertModal from './ShopAlertModal';
import 'src/styles/user/shops/ShopFinder.css'

export default function BookingFormPanel ({shopCode, shopName, menus, onBack, onBookingSuccess}) {
    // 예약 관련 상태
    const [availableSchedule, setAvailableSchedule] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedMenuCode, setSelectedMenuCode] = useState('');
    const [userComment, setUserComment] = useState('');

    // UI 상태
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 예약하기 버튼 활성화 조건
    const isBookingEnable
        = selectedDate && selectedTime && selectedMenuCode;

    // 예약 가능 시간 패치
    useEffect(() => {
        const fetchSchedule = async () => {
            console.log('샵 코드 확인' + shopCode)
            try {
                const res = await fetch(`http://localhost:8080/shops/reservation/${shopCode}/available-schedule`);
                const data = await res.json();

                if (res.ok && data.results.schedule) {
                    // 배열을 객체로 변환 (날짜를 키로 사용)
                    const info = data.results.schedule.reduce((acc, item) => {
                        acc[item.targetDate] = item.availableTimes;
                        return acc;
                    }, {});
                    setAvailableSchedule(info);
                }
            } catch (error) {
                console.error("Failed to fetch schedule:", error);
            }
        };
        fetchSchedule();
    }, [shopCode]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(''); // 날짜 변경시 시간 초기화
    }

    const handleTimeSelect = () => {
        if(!selectedDate) {
            setError('먼저 날짜를 선택해주세요');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지
        if (!isBookingEnable) return;

        setLoading(true);

        const bookingData = {
            userCode: 1, // TODO. 사용자 ID 처리
            menuCode: selectedMenuCode,
            resvDate: selectedDate.toISOString().split('T')[0], // yyyy-MM-dd 포맷
            resvTime: selectedTime,
            userComment: userComment
        };

        try {
            const res = await fetch(`http://localhost:8080/shops/${shopCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
                });
            const data = await res.json();

            if (res.ok) {
                onBookingSuccess(); // 성공시 부모 컴포넌트 알림
            } else {
                throw new Error (data.message || '예약에 실패했습니다')
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // 가능한 날짜 추출
    const availableDates = Object.keys(availableSchedule).map(d => new Date(d));

    // 가능한 시간 추출
    const availableTimes
        = selectedDate ?
                  availableSchedule[selectedDate.toISOString().split('T')[0]] || [] : [];

    return (
        <div className={'side-panel'}>

            {/*에러 알림창 모달 사용*/}
            {error && (
                <ShopAlertModal
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

        {/*    헤더 */}
            <div className={'panel-header'}>
                <h3>{shopName} 예약</h3>
                <button onClick={onBack} className={'close-btn'}>x</button>
            </div>

        {/*    예약 폼*/}
            <form className={'panel-body booking-form'} onSubmit={handleSubmit}>
                <div className={'form-section'}>
                    <h4>날짜와 시간을 선택해 주세요 <span className={'required'}>*</span></h4>
                    <div className={'date-time-picker'}>
                        <DatePicker
                            className={'picker-button'}
                            selected={selectedDate}
                            onChange={handleDateSelect}
                            locale={ko}
                            dateFormat="yyyy-MM-dd"
                            includeDates={availableDates}
                            placeholderText={'날짜 선택'}
                            isClearable={false}
                        />

                        <select
                            className={'picker-button'}
                            value={selectedTime}
                            onChange={e => setSelectedTime(e.target.value)}
                            onClick={handleTimeSelect}
                        >
                            <option value={''}>시간 선택</option>
                            {availableTimes.map(time => (
                                <option key={time} value={time}>
                                    {/* HH: mm 으로 표시*/}
                                    {time.substring(0, 5)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

            {/*    메뉴 선택 */}
                <div className={'form-section'}>
                    <h4>시술 메뉴를 선택해 주세요 <span className={'required'}>*</span></h4>
                    <div className={'menu-selection-list'}>
                    {/*    카테고리별 메뉴 표시 */}
                        {Object.entries(menus).map(([category, menuList]) => (
                            <div key={category} className={'menu-category'}>
                                <h5>{category}</h5>
                                <div className={'menu-list'}>
                                    {menuList.map(menu => (
                                        <label key={menu.menuCode} className={'radio-label'}>
                                            <input
                                                type="radio"
                                                name="menu"
                                                value={menu.menuCode}
                                                checked={selectedMenuCode === menu.menuCode}
                                                onChange={e => setSelectedMenuCode(Number(e.target.value))}
                                            />
                                            {menu.menuName} ({menu.menuPrice.toLocaleString()}원)
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            {/*    추가 정보 */}
                <div className={'form-section'}>
                    <h4>추가 정보</h4>
                    <textarea
                        placeholder={'매장에 전달할 요청사항을 입력하세요'}
                        value={userComment}
                        onChange={e => setUserComment(e.target.value)}
                    />
                </div>

            {/*    약관 동의 */}
                <div className="form-section">
                    <h4>개인정보 수집, 제공</h4>

                    <div className="terms-container">
                        <Accordion
                            title="이용약관 동의 (필수)"
                            content="이용약관 내용..."
                        />
                    </div>

                    <div className="terms-container">
                        <Accordion
                            title="개인정보 수집 및 이용 동의"
                            content="개인정보 수집 내용..."
                        />
                    </div>

                    <div className="terms-container">
                        <Accordion
                            title="개인정보 제 3자 제공 동의"
                            content="개인정보 제공 내용..."
                        />
                    </div>
                </div>

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    className="cta-button"
                    disabled={!isBookingEnable || loading}
                >
                    {loading ? '예약 처리 중...' : '동의하고 예약하기'}
                </button>
            </form>
        </div>
    )


}