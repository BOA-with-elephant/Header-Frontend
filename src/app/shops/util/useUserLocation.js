'use client';
import { useState, useEffect } from 'react';

// 사용자 현재 위치 가져오는 hook, navigator.geolocation(브라우저 위치 서비스 API) 사용
export default function useUserLocation() {
    // 위치 정보를 저장할 상태
    const [location, setLocation] = useState(null);

    //에러 메시지 저장
    const [error, setError] = useState('');

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('위치 정보를 지원하지 않는 브라우저입니다');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            //성공시
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },

            // 실패했을 때, 기본 위치는 백엔드에서 처리함
            () => {
                setError('위치 정보를 가져오는 데 실패했습니다.')
            }
        );
    }, []); //처음 마운트 시에만 실행

    // hook을 사용하는 컴포넌트에서 받을 수 있는 값들
    return { location, error };
}