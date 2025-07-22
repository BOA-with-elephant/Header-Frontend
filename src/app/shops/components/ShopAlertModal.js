'use client';

import 'src/styles/user/shops/ShopFinder.css'

// 알림 메시지 모달 컴포넌트
export default function ShopAlertModal({message, onClose, linkUrl, linkText}) {
    // message 없으면 렌더링 안 함
    const messagePart = message.split('\n').map((part, index) => (
        <span key={index}>{part}<br /></span>
    ));

    // 메시지, 닫힘 상태 관리, 메시지창 속에 링크 관리
    return (
        <div className={'modal-overlay'}>
            <div className={'modal-content'}>
                <p>
                    {messagePart}
                    {linkUrl && <a href={linkUrl} className="modal-link">{linkText}</a>}
                </p>
                <button onClick={onClose}>확인</button>
            </div>
        </div>
    );
}