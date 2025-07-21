'use client';
import { useRef, useCallback } from 'react';

// 무한 스크롤 구현
export default function useInfiniteScroll(callback) {

    // DOM 요소 직접 참조함
    const observer = useRef();

    // 스크롤 감지 함수
    return useCallback(cb => {
        //기존 observer 연결 해제
        if(observer.current) observer.current.disconnect();

        // 새로운 IntersectionObserver 생성
        observer.current = new IntersectionObserver(newCb => {
            //요소가 화면에 보이면 콜백 실행
            if (newCb[0].isIntersecting) {
                callback();
            }
        });

        // 노드 있으면 관찰 시작
        if(cb) observer.current.observe(cb);
    }, [callback]);
}