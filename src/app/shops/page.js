'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShopsEvent } from '@/lib/util/shopsEvent';
import useUserLocation from "@/app/shops/util/useUserLocation";
import ShopAlertModal from "@/app/shops/components/ShopAlertModal";
import ShopListPanel from "@/app/shops/components/ShopListPanel";
import ShopDetailPanel from "@/app/shops/components/ShopDetailPanel";
import BookingFormPanel from "@/app/shops/components/BookingFormPanel";
import 'src/styles/user/shops/ShopFinder.css';
import KakaoMap from "@/app/shops/components/KakaoMap";

export default function Shops() {
    // 현재 화면 상태
    const [view, setView] = useState('list'); //list', 'detail', 'booking'

    // 선택된 샵
    const [selectedShop, setSelectedShop] = useState(null);

    // 알람 메시지
    const [alert, setAlert] = useState(null);

    // 샵 상태 관리
    const [shops, setShops] = useState([]);

    const { location: userLocation } = useUserLocation();

    // useEffect 사용을 위해 useCallback으로 변경함
    const handleShopSelect = useCallback((shopCode) => {
        setSelectedShop({code: shopCode});
        setView('detail');
    }, []);

    // 상세 조회에서 불러왔던 정보 사용
    const handleShowBooking = (shopInfo, groupedMenus) => {
        setSelectedShop({
            code: selectedShop.code,
            name: shopInfo.name,
            menus: shopInfo.menus,
            groupedMenus: groupedMenus
        });
        setView('booking');
    }

    // 뒤로가기 버튼 (샵 상세 조회/예약 -> 리스트 뷰)
    const handleBackToList = () => {
        setSelectedShop(null);
        setView('list');
    };

    // 뒤로가기 버튼 (예약 -> 샵 상세 뷰)
    const handleBackToDetail = () => {
        setView('detail');
    }

    // 예약 성공
    const handleBookingSuccess = () => {
        setView('list'); // 리스트 뷰
        setSelectedShop(null); // 선택 매장 초기화
        setAlert('예약이 확정되었습니다.\n예약 내역에서 진행 상황을 확인하실 수 있습니다.')
    };

    const handleMarkerClick = (shop) => {
        setSelectedShop({code: shop.shopCode});
        setView('detail');
    }

    useEffect(() => {
        const handleShopSelectionEvent = (data) => {
            console.log('selectShop 이벤트 발생: ', data)
            if (data?.shopCode) {
                handleShopSelect(data.shopCode)
            }
        };

        ShopsEvent.on('selectShop', handleShopSelectionEvent);

        return () => {
            ShopsEvent.remove('selectShop', handleShopSelectionEvent)
        }

    }, [handleShopSelect])

    return (
        <div className={'map-page-container'}>
            {alert &&
                <ShopAlertModal
                    message={alert}
                    onClose={() => setAlert(null)}
                />
            }

            <div className={'left-panel-container'}>
                {view === 'list' && (
                    <ShopListPanel
                        shops={shops}
                        setShops={setShops}
                        onShopSelect={handleShopSelect}
                        userLocation={userLocation}
                    />
                )}
                {view === 'detail' && (
                    <ShopDetailPanel
                        shopCode={selectedShop.code}
                        onBack={handleBackToList}
                        onShowBooking={handleShowBooking}
                    />
                )}
                {view === 'booking' && (
                    <BookingFormPanel
                        shopCode={selectedShop.code}
                        shopName={selectedShop.name}
                        menus={selectedShop.groupedMenus}
                        onBack={handleBackToDetail}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </div>
                <div className={'map-container'}>
                    <KakaoMap
                        shops={shops}
                        userLocation={userLocation}
                        onMarkerClick={handleMarkerClick}
                        selectedShopCode={selectedShop?.code}/>
                </div>
        </div>
    )


}