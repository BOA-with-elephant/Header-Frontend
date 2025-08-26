'use client';

import styles from '@/styles/chat/MessageBubble.module.css';

export default function MessageBubble({ message, assistantColor, onActionClick, onApiActionClick }) {
    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className={`${styles.messageWrapper} ${styles[message.type]}`}>
            <div 
                className={styles.messageBubble}
                style={message.type === 'bot' ? { '--assistant-color': assistantColor } : {}}
            >
                <div className={styles.messageText}>
                    {message.text.split('\n').map((line, index) => (
                        <span key={index}>
                            {line}
                            {index < message.text.split('\n').length - 1 && <br />}
                        </span>
                    ))}

                {message.data?.sub_intent === 'new_recommendation' && 
                message.data?.recommendation && 
                message.data.recommendation.menus &&
                message.data.recommendation.menus.length > 0 && ( // 메뉴가 있는 샵만 메뉴 렌더링
                    <div>
                    <hr/>
                    <h3>{message.data.recommendation.shopName}</h3>
                    <ul>
                        {message.data.recommendation.menus.slice(0, 3).map(menu => (
                            <li key={menu.menuCode}> {menu.menuName}</li> 
                        ))}
                    </ul>
            </div>
        )}


                </div>
                
                <div className={styles.messageTime}>
                    {formatTime(message.timestamp)}
                </div>
            </div>

            {/* 제안된 액션들 */}
            {message.suggestedActions && (
                <div className={styles.suggestedActions}>
                    {message.suggestedActions.map((action, index) => (
                        <button
                            key={index}
                            className={styles.actionButton}
                            onClick={() => onActionClick(action)}
                            style={{ '--assistant-color': assistantColor }}
                        >
                            {action}
                        </button>
                    ))}
                </div>
            )}
            
            {/* 사용자 예약 챗봇 actions 렌더링 */}
            {message.actions && message.actions.length > 0 && (
                <div className={styles.suggestedActions}>
                    {message.actions.map((action, index) => (
                        <button
                            key={index}
                            className={styles.actionButton}
                            onClick={() => onApiActionClick(action, message)}
                            style={{ '--assistant-color': assistantColor }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}