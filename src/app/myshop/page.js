'use client';

import { useState, useEffect } from 'react';

import ShopAlertModal from "@/app/shops/components/ShopAlertModal";
import ShopForm from "@/app/myshop/shop/component/ShopForm";
import MyShopDetailPanel from "@/app/myshop/shop/component/MyShopDetailPanel";
import '@/styles/admin/admin-shop/AdminShop.css'

export default function MyShopPage() {
    const [view, setView] = useState('list'); // list, detail, create, edit
    const [myShops, setMyShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null); // shopCode 또는 shopDetail 객체
    const [alert, setAlert] = useState({ show: false, message: '', linkUrl: '', linkText: '' });


    const fetchMyShops = async () => {

        const token = localStorage.getItem('token');
        if (!token) {
            window.alert('사용자 정보가 유효하지 않습니다')
        }
        console.log(token);

        const testRes = await fetch('http://localhost:8080/api/v1/my-shops', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const testData = await testRes.json();
        console.log(testData);
        if (testRes.ok) setMyShops(testData.results['shop-list']);
    };

    useEffect(() => {
        fetchMyShops();
    }, []);

    useEffect(() => {
        console.log('myShops updated:', myShops);
    }, [myShops]);

    // 상세 정보 패널을 닫고 목록만 보이는 뷰로 전환
    const handleCloseDetail = () => {
        setView('list');
        setSelectedShop(null);
    }

    // 샵를 선택했을 때
    const handleSelectShop = (shop) => {
        setView('detail');
        setSelectedShop(shop);
    }

    // 샵 수정 화면으로 전환
    const handleEditShop = (shopData) => {
        setView('edit');
        setSelectedShop(shopData);
    }

    // 샵 등록 화면으로 전환
    const handleCreateShop = () => {
        setView('create');
        setSelectedShop(null); // 이전 선택 초기화
    }

    const handleCreateSuccess = () => {
        fetchMyShops();
        handleCloseDetail(); // 목록 뷰로 돌아가기
        setAlert({
            show: true,
            message: '신규 샵 등록 완료\n사장님 메뉴를 이용하실 수 있습니다.\n메뉴가 없는 샵은 예약 시스템 사용이 불가능하니,\n바로 메뉴를 등록해 주세요.',
            linkUrl: '/myshop/menu',
            linkText: '메뉴 등록하러 가기'
        });
    };

    const handleUpdateSuccess = () => {
        fetchMyShops();
        handleCloseDetail(); // 목록 뷰로 돌아가기
        window.alert('샵 정보가 성공적으로 수정되었습니다.')
    };

    const handleFormSubmit = async (formData) => {
        const isCreating = view === 'create';
        const url = isCreating
            ? 'http://localhost:8080/api/v1/my-shops'
            : `http://localhost:8080/api/v1/my-shops/${selectedShop.shopCode}`;

        const method = isCreating ? 'POST' : 'PUT';

        const body = {
            ...formData,
            shopPhone: formData.shopPhone,
        };
        delete body.mainAddress;
        delete body.detailAddress;

        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            isCreating ? handleCreateSuccess() : handleUpdateSuccess();
        } else {
            window.alert('요청에 실패하였습니다.')
        }
    };

    const handleDeleteShop = async (shopCode) => {
        if (window.confirm('정말로 해당 샵을 삭제하시겠습니까?')) {
            const res = await fetch(`http://localhost:8080/api/v1/my-shops/${shopCode}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if(res.ok) {
                window.alert('샵이 삭제되었습니다.')
                fetchMyShops();
                handleCloseDetail(); // 목록 뷰로 돌아가기
            } else {
                window.alert('삭제에 실패했습니다.')
            }
        }
    };

    return (
        <div className="my-shop-container">
            {alert.show && (
                <ShopAlertModal
                    message={alert.message}
                    linkUrl={alert.linkUrl}
                    linkText={alert.linkText}
                    onClose={() => setAlert({ show: false, message: '', linkUrl: '', linkText: '' })}
                />
            )}

            {/* 1. 'create' 또는 'edit' 뷰일 때는 전체 화면 폼 */}
            {(view === 'create' || view === 'edit') ? (
                <ShopForm
                    mode={view}
                    initialData={view === 'edit' ? selectedShop : null}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseDetail} // 취소하면 목록으로 돌아갑니다.
                />
            ) : (
                /* 2. 그 외의 뷰('list', 'detail')일 때는 리스트-상세 레이아웃 */
                <div className="list-detail-layout">
                    <div className="list-panel">
                        <h2>나의 샵 목록</h2>
                        <div className="my-shops-list">
                            {myShops.length > 0 ? myShops.map(shop => (
                                <div key={shop.shopCode} className="my-shop-item" onClick={() => handleSelectShop(shop)}>
                                    <h4>{shop.shopName}<span>{shop.categoryName}</span></h4>
                                    <p>{shop.shopLocation}</p>
                                    <p>{shop.shopPhone}</p>
                                </div>
                            )) : <p>등록된 샵이 없습니다.</p>}
                        </div>
                        <button className="primary-button" onClick={handleCreateShop}>새로운 샵 등록</button>
                    </div>

                    {/* 3. 샵이 선택되었을 때(view === 'detail')만 상세 패널 */}
                    {view === 'detail' && selectedShop && (
                        <MyShopDetailPanel
                            shopData={selectedShop}
                            onEdit={handleEditShop}
                            onDelete={handleDeleteShop}
                            onBack={handleCloseDetail}
                        />
                    )}
                </div>
            )}
        </div>
    );
}