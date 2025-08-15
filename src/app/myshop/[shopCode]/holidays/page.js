'use client';

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import ShopAlertModal from "@/app/shops/components/ShopAlertModal";
import HolidayForm from './components/HolidayForm';
import HolidayList from './components/HolidayList';

import 'src/styles/admin/admin-shop/ShopHoliday.css';

export default function MyShopHoliday() {
    const params = useParams();
    const shopCode = params.shopCode;

    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '' });

    const [formMode, setFormMode] = useState('create');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);

    const fetchHolidays = async () => {
        if (!shopCode) return;
        setLoading(true);
        try {
            // const res = await fetch(`http://localhost:8080/api/v1/my-shops/${shopCode}/holidays`, {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopCode}/holidays`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await res.json();
            if (res.ok) {
                setHolidays(data.results['holiday-list'] || []);
            } else {
                throw new Error('샵 휴일 정보 가져오기 실패');
            }
        } catch (error) {
            window.alert('샵 휴일 정보 가져오기에 실패했습니다.')
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopCode) {
            fetchHolidays();
        }
    }, [shopCode]);

    const handleFormSubmit = async (formData) => {
        // 임시 휴일 중복 등록 방지
        if (!formData.isHolRepeat) {
            const newStart = new Date(formData.startDate);
            const newEnd = new Date(formData.endDate);

            if (newStart > newEnd) {
                window.alert('종료 날짜는 시작 날짜보다 빠를 수 없습니다.')
                return;
            }

            const isOverlapping = holidays.some(hol => {
                // 수정 모드일 때, 자기 자신은 검사에서 제외
                if (formMode === 'edit' && hol.shopHolCode === editingHoliday.shopHolCode) {
                    return false;
                }
                if (!hol.isHolRepeat) {
                    const existingStart = new Date(hol.holStartDate);
                    const existingEnd = new Date(hol.holEndDate);
                    // 날짜 범위 겹침 확인: (StartA <= EndB) and (StartB <= EndA)
                    return newStart <= existingEnd && existingStart <= newEnd;
                }
                return false;
            });

            if (isOverlapping) {
                window.alert('이미 해당 기간에 등록된 임시 휴일이 있습니다.')
                return;
            }
        }

        // 요일 중복 등록 방지
        if (formData.isHolRepeat) {
            const newStart = new Date(formData.startDate);

            const isOverlapping = holidays.some(hol => {
                // 수정 모드일 때, 자기 자신은 검사에서 제외
                if (formMode === 'edit' && hol.shopHolCode === editingHoliday.shopHolCode) {
                    return false;
                }

                if (hol.isHolRepeat) {
                    const existingRegHol = new Date(hol.holStartDate).getDay();
                    const newRegHol = newStart.getDay();

                    return existingRegHol === newRegHol;
                }
                return false;
            });

            if (isOverlapping) {
                window.alert('이미 해당 요일의 정기 휴일이 있습니다.')
                return;
            }
        }

        const url = formMode === 'create'
            // ? `http://localhost:8080/api/v1/my-shops/${shopCode}/holidays`
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopCode}/holidays`
            // : `http://localhost:8080/api/v1/my-shops/${shopCode}/holidays/${editingHoliday.shopHolCode}`;
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopCode}/holidays/${editingHoliday.shopHolCode}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                console.log('서버 응답이 올바르지 않습니다.')
            }
            window.alert('성공적으로 저장되었습니다.');
            setIsFormOpen(false);
            fetchHolidays();
        } catch (error) {
            window.alert('신규 휴일 생성에 실패했습니다.')
        }
    };

    const handleDelete = async (shopHolCode) => {
        if (window.confirm('해당 휴일 정보를 정말로 삭제하시겠습니까?')) {
            try {
                // const res = await fetch(`http://localhost:8080/api/v1/my-shops/${shopCode}/holidays/${shopHolCode}`, {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopCode}/holidays/${shopHolCode}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (!res.ok) {
                    console.log('삭제 요청 패치 실패')
                }
                window.alert('휴일 정보가 삭제되었습니다.')
                fetchHolidays();
            } catch (error) {
                window.alert('휴일 정보 삭제에 실패했습니다.')
            }
        }
    };

    const openFormModal = (mode, holiday = null) => {
        setFormMode(mode);
        setEditingHoliday(holiday);
        setIsFormOpen(true);
    };

    const handleEdit = (holiday) => {
        openFormModal('edit', holiday);
    };

    return (
        <div className="holiday-container">
            {alert.show && (
                <ShopAlertModal message={alert.message} onClose={() => setAlert({ show: false, message: '' })} />
            )}
            {isFormOpen && (
                <HolidayForm
                    mode={formMode}
                    holiday={editingHoliday}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                    onShowAlert={(message) => setAlert({ show: true, message })}
                />
            )}

            <div className="holiday-panel">
                <div>
                    <a href={`/myshop`} >
                        〈
                    </a>
                </div>
                <div className="panel-header">
                    <h2>휴일 관리</h2>
                    <button className="primary-button" onClick={() => openFormModal('create')}>
                        + 새 휴일 추가
                    </button>
                </div>
                <HolidayList
                    holidays={holidays}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}