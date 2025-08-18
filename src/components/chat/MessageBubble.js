'use client';

import styles from '@/styles/chat/MessageBubble.module.css';

/**
 * Render a chat message bubble with optional suggested-action buttons.
 *
 * Renders message text (preserving line breaks), a localized timestamp (ko-KR, HH:MM),
 * and — when present — suggested action buttons that invoke the provided callback.
 *
 * @param {Object} message - Message data.
 * @param {'bot'|'user'} message.type - Message sender type; when 'bot' the assistantColor is applied.
 * @param {string} message.text - Message text; newline characters are rendered as line breaks.
 * @param {Date} message.timestamp - Timestamp displayed as a localized time string.
 * @param {string[]} [message.suggestedActions] - Optional array of suggested action labels.
 * @param {string} assistantColor - CSS color value applied to bot bubble and action buttons.
 * @param {function(string): void} onActionClick - Called with the action label when a suggested-action button is clicked.
 * @returns {JSX.Element} The message bubble element.
 */
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