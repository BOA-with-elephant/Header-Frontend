import { useState, useEffect , useCallback} from 'react';
import { CustomersAPI } from '@/lib/api';
import { useApi } from './useApi';

export function useCustomers(shopId) {
    const [customers, setCustomers] = useState([]);
    const { execute, loading, error } = useApi();

    const transformApiData = (apiData) => {
        return apiData.map(customer => ({
            id: customer.clientCode,
            clientCode: customer.clientCode,
            name: customer.userName,
            phone: customer.phone,
            birthday: customer.birthday,
            sendable: customer.sendable,
            isVip: customer.memo?.includes('VIP') || false, // 메모에 VIP가 있으면 VIP로 표시
            lastVisit: customer.lastVisited === '방문 기록 없음' ? '방문 기록 없음' : customer.lastVisited,
            visitCount: customer.visitCount,
            totalAmount: customer.totalPaymentAmount,
            preferredServices: customer.favoriteMenuName ? [customer.favoriteMenuName] : [],
            memo: customer.memo || ''
        }));
    };

    // 고객 목록 조회
    const fetchCustomers = useCallback(async () => {
        try {
            const response = await execute(CustomersAPI.getCustomers, shopId);
            const transformedData = transformApiData(response.data);
            setCustomers(transformedData|| []);
        } catch (error) {
            console.error('고객 목록 조회 실패:', error);
        }
    }, [shopId, execute]);

    // 고객 추가
    const addCustomer = async (customerData) => {
        const response = await execute(CustomersAPI.createCustomer, shopId, customerData);
        await fetchCustomers(); // 목록 새로고침
        return response;
    };

    // 고객 삭제
    const deleteCustomer = async (clientCode) => {
        await execute(CustomersAPI.deleteCustomer, shopId, clientCode);
        setCustomers(prev => prev.filter(c => c.clientCode !== clientCode));
    };

    // 메모 업데이트
    const updateMemo = async (clientCode, memo) => {
        await execute(CustomersAPI.updateCustomerMemo, shopId, clientCode, memo);
        setCustomers(prev => prev.map(c => 
            c.clientCode === clientCode ? { ...c, memo } : c
        ));
    };

    useEffect(() => {
        if (shopId) {
            fetchCustomers();
        }
    }, [shopId, fetchCustomers]);

    return {
        customers,
        loading,
        error,
        addCustomer,
        deleteCustomer,
        updateMemo,
        refetch: fetchCustomers
    };
}