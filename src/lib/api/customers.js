import apiClient from './client';
import { API_CONFIG } from '@/lib/config/constants';

export const CustomersAPI = {
    // 고객 목록 조회
    getCustomers: (shopId) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST(shopId));
    },

    // 고객 상세 조회 (히스토리 포함)
    getCustomer: (shopId, clientCode) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(shopId, clientCode));
    },

    // 고객 추가
    createCustomer: (shopId, customerData) => {
        return apiClient.post(API_CONFIG.ENDPOINTS.CUSTOMERS.CREATE(shopId), customerData);
    },

    // 고객 메모 수정 - constants에 추가 필요
    updateCustomerMemo: (shopId, clientCode, memo) => {
        return apiClient.patch(
            `${API_CONFIG.ENDPOINTS.CUSTOMERS.UPDATE(shopId, clientCode)}?memo=${encodeURIComponent(memo)}`
        );
    },

    // 고객 삭제
    deleteCustomer: (shopId, clientCode) => {
        return apiClient.delete(API_CONFIG.ENDPOINTS.CUSTOMERS.DELETE(shopId, clientCode));
    }
};