'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/common/MessageModal.module.css';
import templateStyles from '@/styles/admin/message/TemplateModal.module.css';

export default function TemplateEditModal({ isOpen, onClose, onConfirm, template }) {
    const [templateData, setTemplateData] = useState({
        title: '',
        content: '',
        type: 'promotional'
    });

    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef(null);

    // 매개변수 버튼들
    const parameters = [
        { label: '고객명', value: '{고객명}' },
        { label: '샵명', value: '{샵명}' },
        { label: '연락처', value: '{연락처}' },
        { label: '시술명', value: '{시술명}' },
        { label: '샵주소', value: '{샵주소}' }
    ];

    // 템플릿이 변경될 때마다 폼 데이터 업데이트
    useEffect(() => {
        if (isOpen && template) {
            setTemplateData({
                templateCode: template.templateCode, // 추가
                title: template.title || '',
                content: template.content || '',
                type: template.type || 'promotional'
            });
            setCharCount(template.content?.length || 0);
        }
    }, [isOpen, template]);

    // 입력값 변경 처리
    const handleInputChange = (field, value) => {
        setTemplateData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'content') {
            setCharCount(value.length);
        }
    };

    // 매개변수 삽입
    const insertParameter = (paramValue) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = templateData.content.slice(0, start) + paramValue + templateData.content.slice(end);

        handleInputChange('content', newContent);

        // 커서 위치 업데이트
        setTimeout(() => {
            const newCursorPos = start + paramValue.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    // 폼 초기화
    const resetForm = () => {
        setTemplateData({
            title: '',
            content: '',
            type: 'promotional'
        });
        setCharCount(0);
    };

    // 모달 닫기
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 템플릿 수정
    const handleSubmit = () => {
        // 유효성 검사
        if (!templateData.title.trim()) {
            alert('템플릿 제목을 입력해주세요.');
            return;
        }

        if (!templateData.content.trim()) {
            alert('템플릿 내용을 입력해주세요.');
            return;
        }

        onConfirm(templateData);
        resetForm();
    };

    if (!isOpen || !template) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div
                className={`${styles.modal} ${styles.info}`}
                style={{ maxWidth: '600px', width: '95%' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                <div className={styles.modalHeader}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>✏️</span>
                    </div>
                    <h3 className={styles.title}>템플릿 수정</h3>
                </div>

                {/* 모달 본문 */}
                <div className={styles.modalBody} style={{ padding: '0 var(--spacing-2xl) var(--spacing-xl) var(--spacing-2xl)' }}>
                    {/* 템플릿 타입 */}
                    <div className={templateStyles.formGroup}>
                        <label className={templateStyles.label}>템플릿 타입</label>
                        <select
                            value={templateData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className={templateStyles.select}
                        >
                            <option value="promotional">프로모션</option>
                        </select>
                    </div>

                    {/* 템플릿 제목 */}
                    <div className={templateStyles.formGroup}>
                        <label className={templateStyles.label}>템플릿 제목</label>
                        <input
                            type="text"
                            placeholder="템플릿 제목을 입력하세요"
                            value={templateData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={templateStyles.input}
                            maxLength={50}
                        />
                    </div>

                    {/* 매개변수 버튼들 */}
                    <div className={templateStyles.parametersSection}>
                        <label className={templateStyles.label}>매개변수</label>
                        <p className={templateStyles.parametersDescription}>
                            버튼을 클릭하면 커서 위치에 매개변수가 삽입됩니다
                        </p>
                        <div className={templateStyles.parametersGrid}>
                            {parameters.map((param, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={templateStyles.parameterButton}
                                    onClick={() => insertParameter(param.value)}
                                >
                                    {param.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 템플릿 내용 */}
                    <div className={templateStyles.formGroup}>
                        <label className={templateStyles.label}>템플릿 내용</label>
                        <div className={templateStyles.textareaContainer}>
                            <textarea
                                ref={textareaRef}
                                placeholder="템플릿 내용을 입력하세요..."
                                value={templateData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                className={templateStyles.textarea}
                                rows={6}
                                maxLength={1000}
                            />
                            <div className={templateStyles.charCounter}>
                                <span className={`${templateStyles.charCount} ${charCount > 900 ? templateStyles.warning : ''}`}>
                                    {charCount}
                                </span>
                                <span className={templateStyles.charLimit}>/1000</span>
                            </div>
                        </div>
                    </div>

                    {/* 미리보기 */}
                    {templateData.content && (
                        <div className={templateStyles.previewSection}>
                            <label className={templateStyles.label}>미리보기</label>
                            <div className={templateStyles.previewContent}>
                                {templateData.content.split('\n').map((line, index) => (
                                    <p key={index} className={templateStyles.previewLine}>
                                        {line || '\u00A0'}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 모달 푸터 */}
                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnCancel}`}
                        onClick={handleClose}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnConfirm}`}
                        onClick={handleSubmit}
                    >
                        수정
                    </button>
                </div>
            </div>
        </div>
    );
}