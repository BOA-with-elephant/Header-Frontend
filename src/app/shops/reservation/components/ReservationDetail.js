'use client';

import {useState, useEffect} from "react";
import {formatTime} from 'src/app/shops/reservation/util/dateUtils';
import 'src/styles/user/shops/ReservationPage.css'

export default function ReservationDetail ({resvCode, userCode, onClose}) {
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!resvCode) return; //resvCode 없으면 실행 안 함

        const fetchDetail = async () => {
            setLoading(true); //로딩 시작
            setError(''); // 에러 메시지 초기화

            const userCode = 1;

            try {
                const res = await fetch(
                    `http://localhost:8080/shops/reservation/${resvCode}?userCode=${userCode}`
                );

                if(!res.ok) {
                    throw new Error('상세 내역을 불러오는데 실패했습니다.');
                }
                const json = await res.json();
                setDetail(json.results['resv-detail']);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail(); //함수 실행
    }, [resvCode]); //resvCode 바뀔 때마다 실행 (TODO. userCode 처리)

    const handleCancelReservation = async () => {
        if(!window.confirm('정말 예약을 취소하시겠습니까?')) return;

        try {
            const res = await fetch(
                `http://localhost:8080/api/v1/shops/reservation/${resvCode}?userCode=${userCode}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if(!res.ok) {
                throw new Error('예약 취소에 실패했습니다.');
            }
            alert('예약이 성공적으로 취소되었습니다.')
            onClose(true); //성공을 부모에게 알리기
        } catch (err) {
            setError(err.message);
        }
    };

    const canCancle = detail?.resvState === 'APPROVE';

    return (
        <div>
            <div className={'detail-view-content'}>
                <button onClick={() => onClose(false)} className={'close-button'}>
                    x
                </button>
                {loading && <div>로딩 중...</div>}
                {error && <div className={'error-message'}>{error}</div>}

                {detail && (
                    <>
                        <h3 className={'detail-shop-name'}>{detail.shopName}</h3>
                        <p className={'detail-shop-location'}>{detail.shopLocation}</p>

                        <div className={'detail-section'}>
                            <div className={'detail-label'}>일정</div>
                            <div className={'detail-value'}>
                                {detail.resvDate} ({new Date(detail.resvDate).toLocaleDateString('ko-KR', {weekday: 'short'})})
                                {formatTime(detail.resvTime)}
                            </div>

                            <div className={'detail-section'}>
                                <div className={'detail-label'}>내역</div>
                                <div className={'detail-value'}>{detail.menuName}</div>
                            </div>

                            <hr className={'detail-divider'} />

                            <div className={'detail-section'}>
                                <div className={'detail-label'}>예약자 정보</div>
                                <div className={'detail-value'}>{detail.userName}</div>
                                <div className={'detail-value'}>{detail.userPhone}</div>
                            </div>

                            {detail.userComment && (
                                <div className={'detail-section'}>
                                    <div className={'detail-label'}>요청 사항</div>
                                    <div className={'detail-value'}>{detail.userComment}</div>
                                </div>
                            )}

                            <div className={'detail-actions'}>
                                {canCancle ? (
                                    <button onClick={handleCancelReservation}
                                            className={'action-button cancel'}>예약 취소</button>
                                ) : (
                                    <button
                                        onClick={() => onClose(false)}
                                        className={'action-button confirm'}
                                    >
                                        확인
                                    </button>
                                )
                                }
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
