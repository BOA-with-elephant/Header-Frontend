'use client';

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function KakaoMap({ shops, userLocation, onMarkerClick, selectedShopCode }) {
  const mapRef = useRef(null); // Map 인스턴스 저장
  const markersRef = useRef([]); // 생성된 마커 인스턴스 저장

  const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  // 지도 초기화 및 생성
  const initializeMap = () => {
    if (mapRef.current) return; // 지도가 이미 생성되었다면 실행 안 함

    const container = document.getElementById("map");
    const centerPosition = new window.kakao.maps.LatLng(
        userLocation?.latitude || 37.516307, // 사용자 위치 또는 기본 위치
        userLocation?.longitude || 127.118754
    );

    const options = {
      center: centerPosition,
      level: 5,
    };

    mapRef.current = new window.kakao.maps.Map(container, options);
  };

  // 지도에 마커 그리기
  const drawMarkers = () => {
    if (!mapRef.current || !window.kakao) return;

    // 기존 마커 모두 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커 생성 및 추가
    const newMarkers = shops.map(shop => {
      const position = new window.kakao.maps.LatLng(shop.shopLa, shop.shopLong);

      const marker = new window.kakao.maps.Marker({
        position: position,
        title: shop.shopName,
      });

      // 마커 클릭 이벤트 -> 부모에게 shopCode를 전달
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(shop);
      });

      return marker;
    });

    // 지도에 새로운 마커 표시
    newMarkers.forEach(marker => marker.setMap(mapRef.current));

    // 생성된 마커들을 ref에 저장
    markersRef.current = newMarkers;
  };

  // Script 로드 완료 시 지도 초기화
  const handleScriptLoad = () => {
    window.kakao.maps.load(initializeMap);
  };

  // shops 데이터가 변경될 때마다 마커를 다시 그림
  useEffect(() => {
    if (mapRef.current) {
      drawMarkers();
    }
  }, [shops]); // shops 배열이 바뀔 때만 마커 새로고침

  return (
      <>
        <Script
            id="kakao-map-script"
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false`}
            strategy="afterInteractive"
            onLoad={handleScriptLoad}
        />
        <div id="map" style={{ width: '100%', height: '100%' }} />
      </>
  );
}