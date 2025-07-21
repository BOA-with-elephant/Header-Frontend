'use client';
import { useState } from 'react';

import 'src/styles/user/shops/ShopFinder.css'

export default function Accordion({title, content}) {
    // 펼침/접힘 상태 관리
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={'accordion-item'}>
            <div
                className={'accordion-title'}
                onClick={() => setIsOpen(!isOpen)} //원래 있던 상태 반전
            >
                <label>{title}</label>
                <span>{isOpen? '▲' : '▼'}</span>
            </div>
            {/* isOpen (true) 일 때만 content 표시 */}
            {isOpen && <div className={'accordion-content'}>{content}</div>}
        </div>
    );
};