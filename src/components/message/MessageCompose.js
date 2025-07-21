'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/admin/message/MessageCompose.module.css';

export default function MessageCompose({ content, onComplete }) {
    const [messageText, setMessageText] = useState(content || '');
    const [charCount, setCharCount] = useState(content?.length || 0);
    const textareaRef = useRef(null);

    // 매개변수 버튼들
    const parameters = [
        { label: '고객명', value: '{고객명}' },
        { label: '샵명', value: '{샵명}' },
        { label: '위치', value: '{위치}' } // 쿠키에 저장해놓는게 맞는것 같다.
    ];

    // 매개변수 삽입 함수
    const insertParameter = (paramValue) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = messageText.slice(0, start) + paramValue + messageText.slice(end);
        
        setMessageText(newText);
        setCharCount(newText.length);
        
        // 커서 위치 업데이트
        setTimeout(() => {
            const newCursorPos = start + paramValue.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

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

            {/* 매개변수 버튼들 */}
            <div className={styles.parametersSection}>
                <h3 className={styles.parametersTitle}>매개변수</h3>
                <p className={styles.parametersDescription}>
                    아래 버튼을 클릭하면 현재 커서 위치에 매개변수가 삽입됩니다
                </p>
                <div className={styles.parametersGrid}>
                    {parameters.map((param, index) => (
                        <button
                            key={index}
                            className={styles.parameterButton}
                            onClick={() => insertParameter(param.value)}
                            type="button"
                        >
                            {param.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 메세지 작성 영역 */}
            <div className={styles.composeSection}>
                <div className={styles.textareaContainer}>
                    <textarea
                        ref={textareaRef}
                        className={styles.messageTextarea}
                        placeholder="메세지 내용을 입력해주세요...&#10;&#10;매개변수를 사용하면 고객별로 개인화된 메세지를 발송할 수 있습니다.&#10;예) 안녕하세요 {고객명}님! 예약 확인 메세지입니다."
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