import apiClient from './client';
import { API_CONFIG } from '@/lib/config/constants';

export const MessagesAPI = {
    // 메시지 발송
    sendMessage: (shopId, messageData) => {
        return apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES.SEND(shopId), messageData);
    },

    // 메시지 템플릿 조회
    getTemplates: (shopId) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.TEMPLATES(shopId));
    }
};