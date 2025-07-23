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
    },

    // 템플릿 생성
    createTemplate: (shopId, templateData) => {
        return apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES.CREATE_TEMPLATE(shopId), {
            title: templateData.title,
            content: templateData.content
        });
    },

    // 템플릿 수정
    updateTemplate: (shopId, templateData) => {
        return apiClient.put(API_CONFIG.ENDPOINTS.MESSAGES.UPDATE_TEMPLATE(shopId), {
            templateCode: templateData.templateCode,
            title: templateData.title,
            content: templateData.content
        });
    },

    // 템플릿 삭제
    deleteTemplate: (shopId, templateCode) => {
        return apiClient.delete(API_CONFIG.ENDPOINTS.MESSAGES.DELETE_TEMPLATE(shopId, templateCode));
    },

    // 배치 상세 정보 조회
    getBatchDetails: (shopId, messageId) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.BATCH_DETAILS(shopId, messageId));
    },

    // 수신자별 메시지 내용 조회
    getRecipientMessage: (shopId, messageId, historyCode) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.RECIPIENT_MESSAGE(shopId, messageId, historyCode));
    },

    // 메시지 발송 이력 조회
    getMessageHistory: (shopId) => {
        return apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.HISTORY(shopId));
    }

};