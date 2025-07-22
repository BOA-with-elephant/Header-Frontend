'use client';
import { useState, useEffect, useMemo } from 'react';
import 'src/styles/admin/admin-shop/AdminShop.css'

export default function MyShopDetailPanel({ shopData, onEdit, onDelete, onBack }) {
    const [shopDetail, setShopDetail] = useState(shopData); // 초기 데이터
    const [loading, setLoading] = useState(true);

    // useMemo로 메뉴를 카테고리별로 그룹화
    const groupedMenus = useMemo(() => {
        if (!shopDetail?.menus || shopDetail.menus.length === 0) {
            return {}; // 메뉴가 없으면 빈 객체
        }

        return shopDetail.menus.reduce((acc, menu) => {
            const category = menu.menuCategoryName || '기타';
            if (!acc[category]) {
                acc[category] = []; // 카테고리가 없으면 빈 배열 생성
            }
            acc[category].push(menu);
            return acc;
        }, {});
    }, [shopDetail]); // shopDetail이 바뀔 때만 다시 계산

    // 상세 정보 가져오기
    useEffect(() => {
        const fetchFullDetail = async () => {
            if (!shopData?.shopCode) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const res = await fetch(`http://localhost:8080/api/v1/my-shops/${shopData.shopCode}`);
                const data = await res.json();

                if (res.ok && data.results['shop-detail']) {
                    const details = data.results['shop-detail'];

                    if (details.length > 0) {
                        // 메뉴가 있는 경우
                        const firstItem = details[0];
                        const menus = details.map(({ menuName, menuPrice, menuCategoryName }) => ({
                            menuName,
                            menuPrice,
                            menuCategoryName
                        }));
                        setShopDetail({ ...firstItem, menus });
                    } else {
                        // 메뉴가 없는 경우
                        setShopDetail(prev => ({ ...prev, menus: [] }));
                    }
                }
            } catch (error) {
                console.error("상세 정보를 불러오지 못했습니다:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFullDetail();
    }, [shopData]);

    // 로딩 중이거나 데이터가 없을 때
    if (loading) {
        return (
            <div className="detail-panel loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (!shopDetail) {
        return (
            <div className="detail-panel">
                <p>가게 정보를 불러올 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="detail-panel">
            <div className="panel-header">
                <h3>{shopDetail.shopName}</h3>
                <button onClick={onBack} className="close-btn">×</button>
            </div>

            <div className="detail-content">
                <div className="detail-section">
                    <label>업종</label>
                    <p>{shopDetail.categoryName}</p>
                </div>

                <div className="detail-section">
                    <label>주소</label>
                    <p>{shopDetail.shopLocation}</p>
                </div>

                <div className="detail-section">
                    <label>운영시간</label>
                    <p>{shopDetail.shopOpen || '미지정'} - {shopDetail.shopClose || '미지정'}</p>
                </div>

                <div className="detail-section">
                    <label>연락처</label>
                    <p>{shopDetail.shopPhone}</p>
                </div>

                <div className="detail-section">
                    <label>시술 메뉴</label>
                    {Object.keys(groupedMenus).length > 0 ? (
                        <div className="menu-section">
                            {Object.entries(groupedMenus).map(([category, menus]) => (
                                <div key={category} className="menu-category">
                                    <h4>{category}</h4>
                                    {menus.map((menu) => {
                                        // 메뉴 정보가 완전히 없는 경우
                                        const hasInvalidInfo = !menu.menuName && !menu.estTime && menu.menuPrice == null;

                                        if (hasInvalidInfo) {
                                            return (
                                                <div key={menu.menuCode || Math.random()} className="menu-item">
                                                    <span>메뉴 정보 없음. 시스템 내 예약 불가</span>
                                                </div>
                                            );
                                        }

                                        const priceText = menu.menuPrice != null
                                            ? `${menu.menuPrice?.toLocaleString()}원`
                                            : '메뉴 정보 없음 - 시스템 내 예약 불가';

                                        return (
                                            <div key={menu.menuCode || Math.random()} className="menu-item">
                                                <div className="menu-item-info">
                                                    <span>{menu.menuName || '-'}</span>
                                                    {menu.estTime && <small>약 {menu.estTime}분 예상</small>}
                                                </div>
                                                <span className="menu-price">{priceText}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>샵 정보가 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="detail-actions">
                <button className="action-button" onClick={() => onEdit(shopDetail)}>
                    정보 수정
                </button>
                <a href={`/myshop/${shopDetail.shopCode}/holiday`} className="action-button">
                    휴일 관리
                </a>
                <button className="action-button" onClick={() => onDelete(shopDetail.shopCode)}>
                    샵 삭제
                </button>
            </div>
        </div>
    );
}