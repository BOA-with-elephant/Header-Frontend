'use client';

import styles from '@/styles/chat/MessageBubble.module.css';

export default function MessageBubble({ message, assistantColor, onActionClick }) {
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
        </div>
    );
}