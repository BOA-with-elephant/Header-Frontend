const getEnvVar = (key, defaultValue = null) => {
  const value = process.env[key];
  if (!value && defaultValue === null) {
    console.warn(`⚠️ 환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value || defaultValue;
};

// API 관련 상수
export const API_CONFIG = {
  BASE_URL: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8080'),
  TIMEOUT: 10000,
  RETRY_COUNT: 3,

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/auth/session',
      LOGOUT: '/api/v1/auth/session',
      REFRESH: '/api/v1/auth/refresh',
    },
    CUSTOMERS: {
      LIST: (shopId) => `/api/v1/my-shops/${shopId}/customers`,
      DETAIL: (shopId, clientCode) => `/api/v1/my-shops/${shopId}/customers/${clientCode}`,
      CREATE: (shopId) => `/api/v1/my-shops/${shopId}/customers`,
      UPDATE: (shopId, clientCode) => `/api/v1/my-shops/${shopId}/customers/${clientCode}`,
      DELETE: (shopId, clientCode) => `/api/v1/my-shops/${shopId}/customers/${clientCode}`,
      UPDATE_MEMO: (shopId, clientCode, memo) =>
        `/api/v1/my-shops/${shopId}/customers/${clientCode}?memo=${encodeURIComponent(memo)}`,
    },
    MESSAGES: {
      SEND: (shopId) => `/api/v1/my-shops/${shopId}/messages`,
      TEMPLATES: (shopId) => `/api/v1/my-shops/${shopId}/messages/template`,
      CREATE_TEMPLATE: (shopId) => `/api/v1/my-shops/${shopId}/messages/template`,
      UPDATE_TEMPLATE: (shopId) => `/api/v1/my-shops/${shopId}/messages/template`,
      DELETE_TEMPLATE: (shopId, templateCode) => `/api/v1/my-shops/${shopId}/messages/template/${templateCode}`,
      BATCH_DETAILS: (shopId, messageId) => `/api/v1/my-shops/${shopId}/messages/history/${messageId}`,
      RECIPIENT_MESSAGE: (shopId, messageId, historyCode) => `/api/v1/my-shops/${shopId}/messages/history/${messageId}/${historyCode}`,
    }
  },
};