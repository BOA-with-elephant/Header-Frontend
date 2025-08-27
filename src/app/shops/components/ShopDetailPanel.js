'use client';
import {useState, useEffect, useMemo} from "react";
import 'src/styles/user/shops/ShopFinder.css'

export default function ShopDetailPanel({shopCode, onBack, onShowBooking}) {
    const [shopInfo, setShopInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // json 으로 넘어온 flat 데이터 가공 함수, 메뉴를 카테고리별로 그룹화
    // useMemo; 비용이 큰 작업에 사용
    // shopInfo가 변경될 때만 재계산하고, 그 외에는 이전 결과를 재사용
    const groupedMenus = useMemo(() => {
        if (!shopInfo || !shopInfo.menus) return null;

        // reduce - 배열을 객체로 변환하는 패턴 사용
        return shopInfo.menus.reduce((acc, menu) => {
            const category = menu.menuCategoryName; // 그룹화 기준 -> 메뉴 카테고리 이름
            if (!acc[category]) {
                acc[category] = []; // 새 카테고리 이름에 대해 빈 배열 설정
            }
            acc[category].push(menu); // 해당 카테고리에 메뉴 추가
            return acc;
        }, {})
    }, [shopInfo]); // TODO. 메뉴 없을 경우 예약 비활성화/예약 불가 alert

    // 샵 상세 조회
    useEffect(() => {
        const fetchShopDetail = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops/${shopCode}`);
                const data = await res.json();

                if (res.ok && data.results && data.results['shop-detail']) {
                    const detail = data.results['shop-detail'];

                    if (detail.length > 0) {
                        // 가져온 배열에서 첫번째 항목 추출
                        const shop = detail[0];

                        const jsonInfo = {
                            name: shop.shopName,
                            location: shop.shopLocation,
                            phone: shop.shopPhone,
                            open: shop.shopOpen,
                            close: shop.shopClose,

                            menus: detail.map(({
                                                   menuCategoryName,
                                                   menuCode,
                                                   menuName,
                                                   menuPrice,
                                                   estTime
                                               }) => ({
                                menuCategoryName,
                                menuCode,
                                menuName,
                                menuPrice,
                                estTime
                            })),
                        };

                        setShopInfo(jsonInfo);
                    } else {
                        throw new Error('메뉴가 없는 매장은 예약이 불가능합니다. 샵 관리자에게 문의하세요')
                    }
                } else {
                    throw new Error(data.message || '매장 정보를 불러오는데 실패했습니다')
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchShopDetail();
    }, [shopCode]);

    // 로딩 중일 때는 빈 화면
    if (loading) return (
        <div className={'side-panel'}>
            <div className={'loader'}></div>
        </div>
    );

    // 에러 발생시
    if (error) return (
        <div className={'side-panel'}>
            <p>{error}</p>
            <button onClick={onBack}>뒤로</button>
        </div>
    );

    if (!shopInfo) return null;

    return (
        <div className={'side-panel'}>
        {/*  헤더 */}
            <div className={'panel-header'}>
                <h3>{shopInfo.name}</h3>
                <button onClick={onBack} className={'close-btn'}>x</button>
            </div>

        {/*    본문*/}
            <div className="panel-body">
                <div className="shop-contact-info">
                    <span>📍 {shopInfo.location}</span>
                    <span>⏰ {shopInfo.open} - {shopInfo.close}</span>
                    <div className="header-buttons">
                        {/* 예약하기 버튼의 조건부 렌더링 */}
                        {Object.values(groupedMenus).some(
                            (menus) => menus.some((menu) => menu.menuName || menu.estTime || menu.menuPrice != null)
                        )
                            ? (
                                <button
                                    className="cta-button"
                                    onClick={() => onShowBooking(shopInfo, groupedMenus)}
                                >
                                    예약하기
                                </button>
                            )
                            : null}
                        <a href={`tel:${shopInfo.phone}`} className="icon-button">📞</a>
                    </div>
                </div>

                {/* 메뉴 목록은 기존과 동일 */}
                <div className="menu-section">
                    {Object.entries(groupedMenus).map(([category, menus]) => (
                        <div key={category} className="menu-category">
                            <h4>{category}</h4>
                            {menus.map((menu) => {
                                const hasMenuInfo = menu.menuName || menu.estTime || menu.menuPrice != null;
                                const hasPrice = menu.menuPrice != null;

                                if (!hasMenuInfo) {
                                    return (
                                        <div key={menu.menuCode} className="menu-item-warning">
                                            <p>메뉴 정보 없음 - 시스템 내 예약 불가</p>
                                            <p>샵 관리자에게 문의하세요 </p>
                                        </div>
                                    );
                                }

                                const priceText = hasPrice
                                    ? `${menu.menuPrice.toLocaleString()}원`
                                    : '메뉴 정보 없음 - 시스템내 예약 불가, 샵 관리자에게 문의하세요';

                                return (
                                    <div key={menu.menuCode} className="menu-item">
                                        <div className="menu-item-info">
                                            <span>{menu.menuName}</span>
                                            {menu.estTime && <small>약 {menu.estTime}분 예상</small>}
                                        </div>
                                        <span className="menu-price">{priceText}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}