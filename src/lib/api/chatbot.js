// src/lib/api/chatbot.js (권한별 API 엔드포인트 분리)
export const ChatbotAPI = {
    // 샵관리자용 API (userRole === 2)
    admin: {
        customer: {
            sendMessage: async (shopId, message) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopId}/chatbot/customer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        message: message.text,
                        messageType: message.type || 'general'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                return response.json();
            }
        },
        reservation: {
            sendMessage: async (shopId, message) => {

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${shopId}/chatbot/reservation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json',
                        // 'Authorization' : `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        // message: message.text,
                        // messageType: message.type || 'general'
                        question : message.text
                    })
                });
                
                if(!response.ok){
                    throw new Error('Network response was not ok');
                }

                return response.json();
            }
        }
    },

    // 일반회원용 API (userRole === 1)
    user: {
        booking: {
            sendMessage: async (userId, message) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/chatbot/booking`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        message: message.text,
                        messageType: message.type || 'general'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                return response.json();
            }
        },

        support: {
            sendMessage: async (userId, message) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/chatbot/support`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        message: message.text,
                        messageType: message.type || 'general'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                return response.json();
            }
        }
    },

    // 게스트용 API (userRole === null 또는 0)
    guest: {
        info: {
            sendMessage: async (guestId, message) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/guest/chatbot/info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message.text,
                        messageType: message.type || 'general',
                        sessionId: guestId || 'anonymous'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                return response.json();
            }
        },

        guide: {
            sendMessage: async (guestId, message) => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/guest/chatbot/guide`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message.text,
                        messageType: message.type || 'general',
                        sessionId: guestId || 'anonymous'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                return response.json();
            }
        },
    }
}
