'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/admin/message/MessageCompose.module.css';

export default function MessageCompose({ content, onComplete }) {
    const [messageText, setMessageText] = useState(content || '');
    const [charCount, setCharCount] = useState(content?.length || 0);
    const textareaRef = useRef(null);

    // 텍스트 변경 처리
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setMessageText(newText);
        setCharCount(newText.length);
    };

    // 완료 처리
    const handleComplete = () => {
        if (messageText.trim()) {
            onComplete(messageText);
        }
    };

    // 초기 포커스
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>2. 메세지 작성</h2>
                <p className={styles.description}>
                    발송할 메세지 내용을 입력해주세요
                </p>
            </div>

            {/* 메세지 작성 영역 */}
            <div className={styles.composeSection}>
                <div className={styles.textareaContainer}>
                    <textarea
                        ref={textareaRef}
                        className={styles.messageTextarea}
                        placeholder="메세지 내용을 입력해주세요...&#10;&#10;"
                        value={messageText}
                        onChange={handleTextChange}
                        maxLength={1000}
                    />
                    
                    {/* 글자수 카운터 */}
                    <div className={styles.charCounter}>
                        <span className={`${styles.charCount} ${charCount > 900 ? styles.warning : ''}`}>
                            {charCount}
                        </span>
                        <span className={styles.charLimit}>/1000</span>
                    </div>
                </div>

                {/* 미리보기 */}
                {messageText && (
                    <div className={styles.previewSection}>
                        <h4 className={styles.previewTitle}>미리보기</h4>
                        <div className={styles.previewContent}>
                            {messageText.split('\n').map((line, index) => (
                                <p key={index} className={styles.previewLine}>
                                    {line || '\u00A0'}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* 완료 버튼 */}
                <div className={styles.completeSection}>
                    <button
                        className={styles.completeButton}
                        onClick={handleComplete}
                        disabled={!messageText.trim()}
                    >
                        메세지 작성 완료
                    </button>
                </div>
            </div>
        </div>
    );
}