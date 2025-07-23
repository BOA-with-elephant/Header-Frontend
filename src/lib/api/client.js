class ApiClient {
    constructor(baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // 토큰 가져오기
    getAuthToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    // 요청 헤더 생성
    getHeaders(customHeaders = {}) {
        const token = this.getAuthToken();
        return {
            ...this.defaultHeaders,
            ...(token && { Authorization: `Bearer ${token}` }),
            ...customHeaders,
        };
    }

    // 기본 fetch 래퍼
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.headers),
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // 401 에러 시 토큰 만료 처리
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('인증이 필요합니다.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
            }

            return data;
        } catch (error) {
            console.error(`API 요청 실패 [${endpoint}]:`, error);
            throw error;
        }
    }

    // 인증 실패 처리
    handleUnauthorized() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/session';
        }
    }

    // HTTP 메서드별 편의 함수들
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint, data = null) {
        const options = { method: 'DELETE' };

        // body가 있는 경우에만 추가
        if (data !== null && data !== undefined) {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();
export default apiClient;