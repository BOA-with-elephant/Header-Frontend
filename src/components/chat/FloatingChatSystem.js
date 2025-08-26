// src/components/chat/FloatingChatSystem.js (권한 업데이트 수정)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AssistantSelector from './AssistantSelector';
import ChatWindow from './ChatWindow';
import styles from '@/styles/chat/FloatingChatSystem.module.css';

export default function FloatingChatSystem({ userRole, userInfo, viewMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // 드래그 관련 상태 - 기본 위치를 우하단 기준으로 설정
    const [position, setPosition] = useState(() => {
        // 기본값: 우하단에서 24px 떨어진 위치
        return {
            right: 24,
            bottom: 24
        };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isPositionSaved, setIsPositionSaved] = useState(false);
    
    const floatingButtonRef = useRef(null);
    const chatContainerRef = useRef(null);

    // 권한이나 뷰모드가 변경될 때마다 선택된 어시스턴트 초기화
    useEffect(() => {
        if (selectedAssistant) {
            setSelectedAssistant(null);
        }
    }, [userRole, viewMode]);

    // 로컬 스토리지에서 저장된 위치 복원
    useEffect(() => {
        const savedPosition = localStorage.getItem('chatButtonPosition');
        if (savedPosition) {
            try {
                const parsedPosition = JSON.parse(savedPosition);
                setPosition(parsedPosition);
                setIsPositionSaved(true);
            } catch (error) {
                console.error('저장된 위치 복원 실패:', error);
            }
        }
    }, []);

    // 위치 저장
    const savePosition = useCallback((newPosition) => {
        localStorage.setItem('chatButtonPosition', JSON.stringify(newPosition));
    }, []);

    // 절대 좌표를 right/bottom 기준으로 변환
    const convertToRightBottom = useCallback((clientX, clientY) => {
        const buttonSize = 60;
        const padding = 10;
        
        const right = window.innerWidth - clientX - buttonSize;
        const bottom = window.innerHeight - clientY - buttonSize;
        
        return {
            right: Math.max(padding, Math.min(right, window.innerWidth - buttonSize - padding)),
            bottom: Math.max(padding, Math.min(bottom, window.innerHeight - buttonSize - padding))
        };
    }, []);

    // 마우스/터치 이벤트 핸들러
    const handlePointerDown = useCallback((e) => {
        if (isOpen) return; // 채팅창이 열려있으면 드래그 방지
        
        e.preventDefault();
        e.stopPropagation();
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
        
        // 드래그 시작 시 body에 클래스 추가 (다른 요소 상호작용 방지)
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none';
        floatingButtonRef.current.style.pointerEvents = 'auto';
        
    }, [isOpen]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        // 현재 마우스 위치를 기준으로 새 위치 계산
        const newPosition = convertToRightBottom(clientX, clientY);
        setPosition(newPosition);
        
    }, [isDragging, convertToRightBottom]);

    const handlePointerUp = useCallback((e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(false);
        savePosition(position);
        
        // body 스타일 복원
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
        floatingButtonRef.current.style.pointerEvents = '';
        
        // 드래그 후 클릭 이벤트 방지
        setTimeout(() => {
            setIsPositionSaved(true);
        }, 100);
        
    }, [isDragging, position, savePosition]);

    // 전역 이벤트 리스너 등록
    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e) => handlePointerMove(e);
            const handleMouseUp = (e) => handlePointerUp(e);
            const handleTouchMove = (e) => {
                e.preventDefault(); // 스크롤 방지
                handlePointerMove(e);
            };
            const handleTouchEnd = (e) => handlePointerUp(e);
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, handlePointerMove, handlePointerUp]);

    // 화면 크기 변경 시 위치 재조정
    useEffect(() => {
        const handleResize = () => {
            const buttonSize = 60;
            const padding = 10;
            const maxRight = window.innerWidth - buttonSize - padding;
            const maxBottom = window.innerHeight - buttonSize - padding;
            
            setPosition(prev => ({
                right: Math.max(padding, Math.min(prev.right, maxRight)),
                bottom: Math.max(padding, Math.min(prev.bottom, maxBottom))
            }));
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 채팅창 위치 계산
    const getChatContainerStyle = () => {
        const chatWidth = 380;
        const chatHeight = 600;
        const buttonSize = 60;
        const padding = 10;
        
        // 버튼의 실제 화면상 위치 계산
        const buttonRight = position.right;
        const buttonBottom = position.bottom;
        const buttonLeft = window.innerWidth - buttonRight - buttonSize;
        const buttonTop = window.innerHeight - buttonBottom - buttonSize;
        
        let chatLeft = buttonLeft - chatWidth - padding;
        let chatTop = buttonTop - chatHeight + buttonSize;
        
        // 화면 경계 확인 및 조정
        if (chatLeft < padding) {
            chatLeft = buttonLeft + buttonSize + padding; // 버튼 오른쪽에 배치
        }
        
        if (chatTop < padding) {
            chatTop = padding;
        }
        
        if (chatTop + chatHeight > window.innerHeight - padding) {
            chatTop = window.innerHeight - chatHeight - padding;
        }
        
        return {
            position: 'fixed',
            left: `${chatLeft}px`,
            top: `${chatTop}px`,
            right: 'auto',
            bottom: 'auto'
        };
    };

    const toggleChat = () => {
        if (isDragging) return; // 드래그 중에는 토글 방지
        
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const handleAssistantSelect = (assistant) => {
        setSelectedAssistant(assistant);
    };

    const handleBackToSelector = () => {
        setSelectedAssistant(null);
    };

    const handleNewMessage = () => {
        if (!isOpen) {
            setUnreadCount(prev => prev + 1);
        }
    };

    // 실제 사용자 권한 계산 (viewMode 고려)
    const getEffectiveUserRole = () => {
        if (!userRole) return 0; // 로그인하지 않은 사용자
        
        // 실제 관리자 권한이 있고 관리자 뷰모드인 경우
        if (userRole === 2 && viewMode === 'admin') {
            return 2; // 관리자 권한
        }
        
        // 그 외의 경우는 모두 고객 권한으로 처리
        return 1; // 고객 권한
    };

    // 권한별 도우미 목록 정의 (viewMode 반영)
    const getAssistantsByRole = () => {
        const effectiveRole = getEffectiveUserRole();
        
        if (effectiveRole === 2) { // 샵관리자 (관리자 뷰모드)
            return [
                {
                    id: 'customer-helper',
                    name: '고객 도우미',
                    description: '고객 정보 관리와 메모를 도와드려요',
                    icon: '👥',
                    color: '#667eea',
                    apiEndpoint: '/api/v1/chatbot/customer',
                    requiredRole: 2
                },
                {
                    id: 'reservation-helper',
                    name: '예약 관리',
                    description: '예약 현황과 관리를 도와드려요',
                    icon: '📅',
                    color: '#54397F',
                    apiEndpoint: '/api/v1/chatbot/admin/reservation',
                    requiredRole: 2
                }
            ];
        } else if (effectiveRole === 1) { // 일반회원 (고객 뷰모드 또는 일반 사용자)
            return [
                {
                    id: 'booking-helper',
                    name: '예약 도우미',
                    description: '예약 조회와 변경을 도와드려요',
                    icon: '📅',
                    color: '#667eea',
                    apiEndpoint: '/api/v1/chatbot/user/booking',
                    requiredRole: 1
                }
                // { // 없는 기능 주석처리
                //     id: 'support-helper',
                //     name: '고객지원',
                //     description: '이용 중 궁금한 점을 도와드려요',
                //     icon: '🛟',
                //     color: '#f093fb',
                //     apiEndpoint: '/api/v1/chatbot/user/support',
                //     requiredRole: 1
                // }
            ];
        } else { // 비로그인 사용자 : 사용 안하면 삭제 예정
            return [
                {
                    id: 'info-helper',
                    name: '정보 도우미',
                    description: '서비스 소개와 기본 정보를 안내해드려요',
                    icon: 'ℹ️',
                    color: '#667eea',
                    apiEndpoint: '/api/v1/chatbot/guest/info',
                    requiredRole: 0
                },
                {
                    id: 'guide-helper',
                    name: '이용 가이드',
                    description: '회원가입과 이용 방법을 안내해드려요',
                    icon: '📖',
                    color: '#4facfe',
                    apiEndpoint: '/api/v1/chatbot/guest/guide',
                    requiredRole: 0
                }
            ];
        }
    };

    const assistants = getAssistantsByRole();

    // 권한별 환영 메시지 생성 (viewMode 반영)
    const getWelcomeMessage = () => {
        const effectiveRole = getEffectiveUserRole();
        
        if (effectiveRole === 2) {
            return `안녕하세요! ${userInfo?.shopName || '사장님'}을 위한 스마트 도우미입니다 😊\n\n고객 관리, 예약 관리, 매출 분석 등을 도와드려요!\n\n어떤 도움이 필요하세요?`;
        } else if (effectiveRole === 1) {
            const displayName = viewMode === 'customer' && userInfo?.shopName 
                ? `${userInfo.shopName} 관리자님` 
                : (userInfo?.userName || '고객님');
            return `안녕하세요! ${displayName}을 위한 도우미입니다 😊\n\n예약, 문의, 리뷰 등을 편리하게 도와드려요!\n\n무엇을 도와드릴까요?`;
        } else {
            return '안녕하세요! 헤더 서비스 안내 도우미입니다 😊\n\n서비스 소개와 이용 방법을 안내해드려요!\n\n궁금한 것이 있으시면 말씀해주세요.';
        }
    };

    return (
        <>
            {/* 드래그 가능한 플로팅 토글 버튼 */}
            <button 
                ref={floatingButtonRef}
                className={`${styles.floatingToggle} ${isOpen ? styles.active : ''} ${isDragging ? styles.dragging : ''}`}
                onClick={toggleChat}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                aria-label="채팅 도우미"
                style={{
                    right: `${position.right}px`,
                    bottom: `${position.bottom}px`,
                    cursor: isDragging ? 'grabbing' : (isOpen ? 'pointer' : 'grab')
                }}
            >
                {isOpen ? (
                    <span className={styles.closeIcon}>✕</span>
                ) : (
                    <>
                        <span className={styles.chatIcon}>💬</span>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount}</span>
                        )}
                    </>
                )}
                
                {/* 드래그 힌트 */}
                {!isPositionSaved && !isOpen && (
                    <div className={styles.dragHint}>
                        드래그로 이동 가능
                    </div>
                )}
            </button>

            {/* 채팅 창 */}
            {isOpen && (
                <div 
                    ref={chatContainerRef}
                    className={styles.chatContainer}
                    style={getChatContainerStyle()}
                >
                    {!selectedAssistant ? (
                        <AssistantSelector 
                            assistants={assistants}
                            onSelect={handleAssistantSelect}
                            userRole={getEffectiveUserRole()}
                            userInfo={userInfo}
                            welcomeMessage={getWelcomeMessage()}
                            viewMode={viewMode}
                        />
                    ) : (
                        <ChatWindow 
                            assistant={selectedAssistant}
                            onBack={handleBackToSelector}
                            onNewMessage={handleNewMessage}
                            userRole={getEffectiveUserRole()}
                            userInfo={userInfo}
                            viewMode={viewMode}
                            onClose={toggleChat}
                        />
                    )}
                </div>
            )}

            {/* 배경 오버레이 */}
            {isOpen && <div className={styles.overlay} onClick={toggleChat} />}
        </>
    );
}