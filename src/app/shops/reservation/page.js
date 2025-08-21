'use client';

// useMemo; 무거운 함수를 관리
import {useState, useEffect, useMemo} from 'react';
import DatePicker from 'react-datepicker';
import {ko} from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

import ReservationList from "@/app/shops/reservation/components/ReservationList";
import ReservationDetail from "@/app/shops/reservation/components/ReservationDetail";
import 'src/styles/user/shops/ReservationPage.css'

export default function UserReservation() {
    const [reservations, setReservations] = useState([]); //예약 목록
    const [selectedResvCode, setSelectedResvCode] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1); //3개월 전부터
        return d;
    });

    const [endDate, setEndDate] = useState(new Date()); //오늘까지

    const fetchReservations = async (start, end) => {
        if (!start || !end) {
            alert('조회 날짜를 선택해 주세요')
            return;
        }

        if(start > end) {
            alert('조회 시작 날짜는 조회 종료 날짜보다 미래여야 합니다')
            return;
        }
        setLoading(true);
        setError('');

        const formatDate = (date) => date.toISOString().split('T')[0];

        try {
            console.log('포맷 전 데이터 확인' + start + ''  + end)
            const res = await fetch(
                // `http://localhost:8080/api/v1/shops/reservation?startDate=${formatDate(start)}&endDate=${formatDate(end)}`, {
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops/reservation?startDate=${formatDate(start)}&endDate=${formatDate(end)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }

            )
            console.log('데이트 포맷 확인: ' + formatDate(start) + 'and' + formatDate(end))
            if (!res.ok) {
                window.alert('예약 내역 조회에 실패했습니다.')
            }
            const json = await res.json();
            console.log('데이터 확인' + json);
            console.log(json);
            setReservations(json.results?.['resv-list'])
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('useEffect 시작' + startDate + endDate);
        fetchReservations(startDate, endDate);
    }, []);

    //날짜별 그룹화
    const groupedReservation = useMemo(() => {
        return reservations.reduce((acc, resv) => {
            const date = resv.resvDate;
            if(!acc[date]) {
                acc[date] = []; //해당 날짜가 처음 설정되는 거면 빈 배열
            }
            acc[date].push(resv); // 해당 날짜에 예약 정보 추가
            return acc;
        }, {})
    }, [reservations]); //reservations가 바뀔 때만

    const handleDateFilter = () => {
        fetchReservations(startDate, endDate);
    };

    const handleCloseDetail = (didAction) => {
        setSelectedResvCode(null);
        //예약 취소 등 변경 있었으면 목록 새로고침
        if(didAction) {
            fetchReservations(startDate, endDate);
        }
    };

    return (
        <div className={'page-container'}>
            <div className={'reservation-list-panel'}>
                <div className={'filter-container'}>
                    <DatePicker
                        locale={ko}
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat={'yyyy-MM-dd'}
                        className={'date-picker-input'}
                    />
                    <span className={'date-separator'}>~</span>
                    <DatePicker
                        locale={ko}
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat={'yyyy-MM-dd'}
                        className={'date-picker-input'}
                    />
                    <button
                        onClick={handleDateFilter}
                        className={'filter-button'}
                        disabled={loading}>
                        {loading?'조회 중...' : '조회'}
                    </button>
                </div>

                {error && <div className={'error-message'}>{error}</div>}
                <ReservationList
                    groupedReservations={groupedReservation}
                    onReservationSelect={setSelectedResvCode}
                />
            </div>

            {selectedResvCode && (
                <ReservationDetail
                    resvCode={selectedResvCode}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    )


}