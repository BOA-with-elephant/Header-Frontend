'use client';

import 'src/styles/user/shops/ShopFinder.css'

// 알림 메시지 모달 컴포넌트
export default function ShopAlertModal({message, onClose}) {
    // message 없으면 렌더링 안 함
    if (!message) return null;

    return (
        <div className={'modal-overlay'}>
            <div className={'modal-content'}>
                <p>{message}</p>
                <button onClick={onClose}>확인</button>
            </div>
        </div>
    )
}