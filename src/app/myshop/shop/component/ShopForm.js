'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import {autoHyphen} from "@/app/myshop/shop/util/autoHyphen.js";
import Accordion from "@/app/shops/components/Accordion.js";
import 'src/styles/admin/admin-shop/AdminShop.css'

export default function ShopForm({ mode = 'create', initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        shopName: '',
        categoryCode: '',
        shopPhone: '',
        mainAddress: '',
        detailAddress: '',
        shopOpen: '09:00',
        shopClose: '18:00',
    });

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 카테고리 목록 가져오기
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // const res = await fetch('http://localhost:8080/api/v1/shops/categories');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops/categories`);
                const data = await res.json();
                if (res.ok) {
                    setCategories(data.results['shop-categories']);
                }
            } catch (error) {
                console.error('카테고리 목록을 불러오지 못했습니다:', error);
            }
        };

        fetchCategories();
    }, []);

    // 수정 모드일 때 초기 데이터 설정
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                shopName: initialData.shopName || '',
                categoryCode: initialData.categoryCode || '',
                shopPhone: autoHyphen(initialData.shopPhone || ''),
                // 주소 분리 (예: "서울시 강남구 역삼동 123번지" → "서울시 강남구 역삼동" + "123번지")
                mainAddress: initialData.shopLocation?.split(' ').slice(0, -1).join(' ') || '',
                detailAddress: initialData.shopLocation?.split(' ').slice(-1)[0] || '',
                shopOpen: initialData.shopOpen || '09:00',
                shopClose: initialData.shopClose || '18:00',
            });
        }
    }, [mode, initialData]); // mode나 initialData가 바뀔 때 실행

    // 입력값이 바뀔 때 처리
    const handleChange = (e) => {
        const {name, value} = e.target; // 입력 필드의 name과 value 가져오기

        if (name === 'shopPhone') {
            // 전화번호는 자동 하이픈 적용
            setFormData(prev => ({
                ...prev,
                [name]: autoHyphen(value)
            }));
        } else {
            // 다른 필드들은 그냥 저장
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
        // 주소 검색 기능
        const handleAddressSearch = () => {
            new window.daum.Postcode({
                oncomplete: function (data) {
                    setFormData(prev => ({
                        ...prev,
                        mainAddress: data.roadAddress
                    }));
                },
            }).open();
        };

        // 폼 제출 처리
        const handleSubmit = async (e) => {
            e.preventDefault(); // 페이지 새로고침 방지
            setIsLoading(true);

            const fullLocation = `${formData.mainAddress} ${formData.detailAddress}`;

            // 유효성 검사
            if (fullLocation.length > 50) {
                alert('주소는 50자를 초과할 수 없습니다.');
                setIsLoading(false);
                return;
            }

            // 부모 컴포넌트에 데이터 전달
            await onSubmit({
                ...formData,
                shopLocation: fullLocation,
            });

            setIsLoading(false);
        };

        // 시간 선택 옵션 만들기
        const timeOptions = Array.from({length: 24 * 2}, (_, i) => {
            const hours = String(Math.floor(i / 2)).padStart(2, '0');
            const minutes = i % 2 === 0 ? '00' : '30';
            return `${hours}:${minutes}`;
        });

        return (
            <div className="form-panel">
                <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"/>
                <form onSubmit={handleSubmit}>
                    <h2>{mode === 'create' ? '샵 등록하기' : '샵 수정하기'}</h2>

                    <label>업체명을 입력해주세요 *</label>
                    <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        required
                    />

                    <label>업종을 선택해주세요 *</label>
                    <select
                        name="categoryCode"
                        value={formData.categoryCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>업종 선택</option>
                        {categories.map(cat => (
                            <option key={cat.categoryCode} value={cat.categoryCode}>
                                {cat.categoryName}
                            </option>
                        ))}
                    </select>

                    <label>업체 전화번호를 입력해주세요 *</label>
                    <input
                        type="tel"
                        name="shopPhone"
                        value={formData.shopPhone}
                        onChange={handleChange}
                        placeholder="02-1234-5678"
                        required
                    />

                    <label>업체 주소를 입력해주세요 *</label>
                    <div className="address-group">
                        <input
                            type="text"
                            name="mainAddress"
                            value={formData.mainAddress}
                            placeholder="도로명 주소"
                            readOnly
                            required
                        />
                        <button type="button" onClick={handleAddressSearch}>
                            주소 검색
                        </button>
                    </div>
                    <input
                        type="text"
                        name="detailAddress"
                        value={formData.detailAddress}
                        onChange={handleChange}
                        placeholder="상세 주소"
                        required
                    />

                    <label>운영 시간을 선택해주세요 *</label>
                    <div className="time-group">
                        <select
                            name="shopOpen"
                            value={formData.shopOpen}
                            onChange={handleChange}
                        >
                            {timeOptions.map(t => (
                                <option key={`open-${t}`} value={t}>{t}</option>
                            ))}
                        </select>
                        <span>~</span>
                        <select
                            name="shopClose"
                            value={formData.shopClose}
                            onChange={handleChange}
                        >
                            {timeOptions.map(t => (
                                <option key={`close-${t}`} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {mode === 'create' && (
                        <div className="terms-section">
                            <h4>개인정보 수집, 제공</h4>
                            <Accordion title="이용약관 동의" content="이용약관 내용입니다..."/>
                            <Accordion title="개인정보 수집 및 이용 동의" content="개인정보 수집 및 이용 동의 내용입니다..."/>
                            <Accordion title="개인정보 제3자 제공 동의" content="개인정보 제3자 제공 동의 내용입니다..."/>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="secondary-button" onClick={onCancel}>
                            취소
                        </button>
                        <button type="submit" className="primary-button" disabled={isLoading}>
                            {isLoading ? '처리 중...' : (mode === 'create' ? '동의하고 등록하기' : '수정 완료')}
                        </button>
                    </div>
                </form>
            </div>
        );
    }