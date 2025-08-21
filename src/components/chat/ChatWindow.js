'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatbotAPI } from '@/lib/api/chatbot';
import { useApi } from '@/hooks/useApi';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import styles from '@/styles/chat/ChatWindow.module.css';

export default function ChatWindow({ 
    assistant, 
    onBack, 
    onNewMessage, 
    userRole, 
    userInfo 
}) {
    // const shopId = userInfo?.shopCode || userInfo?.userCode || 1;
    const shopId = userInfo?.shopCode || 1;
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: `안녕하세요! ${assistant.name}입니다 😊\n\n${assistant.description}\n\n무엇을 도와드릴까요?`,
            timestamp: new Date(),
            assistant: assistant.id
        }
    ]);
    
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { execute, loading } = useApi();

    // 권한별 도우미별 빠른 액션들
    const getQuickActions = () => {
        if (userRole === 2) { // 샵관리자
            switch (assistant.id) {
                case 'customer-helper':
                    return [
                        { label: '오늘 예약 고객', message: '오늘 올 고객들 알려줘' },
                        { label: 'VIP 고객', message: 'VIP 고객들 보여줘' },
                        { label: '생일 고객', message: '이번 주 생일인 고객들' },
                        { label: '미방문 고객', message: '최근에 안 온 고객들' }
                    ];
                case 'reservation-helper':
                    return [
                        { label: '예약 요약 & 통계', message: '이번 주 예약 현황 요약해줘' },
                        { label: '예약 취소/변경 내역', message: '이번 달 예약 취소된 내역 알려줘' },
                        { label: '단골 손님', message: '가장 많이 예약해준 고객을 10명 추려줘' },
                        { label: '빈 시간대 확인', message: '이번 달 예약 가능한 시간대 확인해줘' }
                    ];
                case 'sales-helper':
                    return [
                        { label: '오늘 매출', message: '오늘 매출 어때' },
                        { label: '이번 달', message: '이번 달 매출 현황' },
                        { label: '인기 메뉴', message: '가장 인기 있는 메뉴는' },
                        { label: '매출 분석', message: '매출 분석 보여줘' }
                    ];
                case 'message-helper':
                    return [
                        { label: '생일 메시지', message: '생일 고객들에게 메시지 보내고 싶어' },
                        { label: '재방문 유도', message: '안 온 고객들에게 할인 메시지' },
                        { label: '예약 확인', message: '내일 예약 고객들에게 확인 메시지' },
                        { label: '발송 현황', message: '최근 메시지 발송 현황' }
                    ];
                case 'menu-helper':
                    return [
                        { label: '메뉴 목록', message: '현재 메뉴 목록 보여줘' },
                        { label: '인기 메뉴', message: '가장 인기 있는 메뉴 알려줘' },
                        { label: '가격 분석', message: '메뉴별 수익성 분석해줘' },
                        { label: '신메뉴 추천', message: '트렌드에 맞는 신메뉴 추천해줘' }
                    ];
                default:
                    return [];
            }
        } else if (userRole === 1) { // 일반회원
            switch (assistant.id) {
                case 'booking-helper':
                    return [
                        { label: '예약 조회', message: '내 예약 확인해줘' },
                        { label: '예약 변경', message: '예약 시간 변경하고 싶어' },
                        { label: '예약 취소', message: '예약 취소하고 싶어' },
                        { label: '새 예약', message: '새로 예약하고 싶어' }
                    ];
                case 'inquiry-helper':
                    return [
                        { label: '서비스 안내', message: '어떤 서비스들이 있어?' },
                        { label: '가격 문의', message: '가격이 궁금해' },
                        { label: '위치 안내', message: '샵 위치 알려줘' },
                        { label: '영업시간', message: '영업시간이 언제야?' }
                    ];
                case 'review-helper':
                    return [
                        { label: '리뷰 작성', message: '리뷰 작성하고 싶어' },
                        { label: '내 리뷰', message: '내가 쓴 리뷰 보여줘' },
                        { label: '리뷰 수정', message: '리뷰 수정하고 싶어' },
                        { label: '평점 확인', message: '이 샵 평점이 어때?' }
                    ];
                case 'support-helper':
                    return [
                        { label: '이용 방법', message: '앱 사용법 알려줘' },
                        { label: '문제 신고', message: '문제가 있어서 신고하고 싶어' },
                        { label: '계정 관리', message: '계정 설정 도움이 필요해' },
                        { label: 'FAQ', message: '자주 묻는 질문 보여줘' }
                    ];
                default:
                    return [];
            }
        } else { // 게스트
            switch (assistant.id) {
                case 'info-helper':
                    return [
                        { label: '서비스 소개', message: '헤더가 뭐야?' },
                        { label: '주요 기능', message: '어떤 기능들이 있어?' },
                        { label: '이용 혜택', message: '가입하면 뭐가 좋아?' },
                        { label: '요금 안내', message: '이용료가 있어?' }
                    ];
                case 'guide-helper':
                    return [
                        { label: '회원가입', message: '어떻게 가입해?' },
                        { label: '로그인 방법', message: '로그인은 어떻게 해?' },
                        { label: '이용 가이드', message: '처음 사용법 알려줘' },
                        { label: '고객지원', message: '문의는 어디에 해?' }
                    ];
                default:
                    return [];
            }
        }
    };

    // API 함수 매핑 (권한별로 다른 엔드포인트)
    const getAPIFunction = () => {
        const apiMap = {
            2: { // 샵관리자
                'customer-helper': ChatbotAPI.admin.customer,
                'reservation-helper': ChatbotAPI.admin.reservation.sendMessage,
                'sales-helper': ChatbotAPI.admin.sales,
                'message-helper': ChatbotAPI.admin.message,
                'menu-helper': ChatbotAPI.admin.menu
            },
            1: { // 일반회원
                'booking-helper': ChatbotAPI.user.booking,
                'inquiry-helper': ChatbotAPI.user.inquiry,
                'review-helper': ChatbotAPI.user.review,
                'support-helper': ChatbotAPI.user.support
            },
            0: { // 게스트
                'info-helper': ChatbotAPI.guest.info,
                'guide-helper': ChatbotAPI.guest.guide
            }
        };

        return apiMap[userRole]?.[assistant.id] || null;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (messageText = inputText) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: messageText,
            timestamp: new Date(),
            assistant: assistant.id
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            const apiFunction = getAPIFunction();
            
            if (apiFunction) {
                const response = await execute(apiFunction, shopId, {
                    text: messageText,
                    type: 'general'
                });

                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    // text: response.data.botReply || response.data.message,
                    // text: response.data?.answer || "답변을 불러올 수 없습니다.",
                    text: response?.answer || "답변을 불러올 수 없습니다.",
                    timestamp: new Date(),
                    assistant: assistant.id,
                    suggestedActions: response.data?.suggestedActions || []
                };

                setMessages(prev => [...prev, botMessage]);
                onNewMessage?.();
                
            } else {
                // API가 없는 경우 권한별 임시 응답
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const mockResponse = {
                    botReply: `${assistant.name}가 "${messageText}"에 대해 처리했어요!\n\n곧 실제 API와 연결될 예정입니다 🚀`,
                    suggestedActions: ['다른 질문하기', '메뉴로 돌아가기']
                };

                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: mockResponse.botReply,
                    timestamp: new Date(),
                    assistant: assistant.id,
                    suggestedActions: mockResponse.suggestedActions
                };

                setMessages(prev => [...prev, botMessage]);
                onNewMessage?.();
            }
            
        } catch (error) {
            console.error('채팅 메시지 전송 오류:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: '죄송해요, 처리 중 오류가 발생했어요. 다시 시도해주세요.',
                timestamp: new Date(),
                assistant: assistant.id
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <div className={styles.header} style={{ '--assistant-color': assistant.color }}>
                <button className={styles.backButton} onClick={onBack}>
                    ←
                </button>
                <div className={styles.assistantInfo}>
                    <span className={styles.assistantIcon}>{assistant.icon}</span>
                    <div>
                        <h3 className={styles.assistantName}>{assistant.name}</h3>
                        <p className={styles.assistantStatus}>
                            {loading ? '입력 중...' : '온라인'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className={styles.messagesContainer}>
                {messages.map((message) => (
                    <MessageBubble 
                        key={message.id} 
                        message={message}
                        assistantColor={assistant.color}
                        onActionClick={handleSendMessage}
                    />
                ))}

                {isTyping && (
                    <div className={styles.typingIndicator}>
                        <div className={styles.typingBubble}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* 빠른 액션 */}
            <QuickActions 
                actions={getQuickActions()}
                onActionClick={handleSendMessage}
                assistantColor={assistant.color}
            />

            {/* 입력 영역 */}
            <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`${assistant.name}에게 메시지를 보내세요...`}
                        disabled={loading}
                        rows={1}
                        className={styles.messageInput}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={loading || !inputText.trim()}
                        className={styles.sendButton}
                        style={{ '--assistant-color': assistant.color }}
                    >
                        {loading ? '⏳' : '📤'}
                    </button>
                </div>
            </div>
        </div>
    );
}