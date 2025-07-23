'use client';

import { useState } from 'react';
import MessageTypeSelection from '@/components/message/MessageTypeSelection';
import TemplateSelection from '@/components/message/TemplateSelection';
import MessageCompose from '@/components/message/MessageCompose';
import SendOptions from '@/components/message/SendOptions';
import MessageModal from '@/components/ui/MessageModal';
import styles from '@/styles/admin/message/MessageSlideModal.module.css';

import { useMessageModal } from '@/hooks/useMessageModal';

export default function MessageSlideModal({ isOpen, onClose, recipientSelection}) {
    const { modal, closeModal, showError, showSuccess, showConfirm } = useMessageModal();
    
    // 임시 shopId
    const SHOP_ID = 2;

    // 현재 단계 상태
    const [currentStep, setCurrentStep] = useState(1);

    // 메세지 유형 상태 ('template' 또는 'direct')
    const [messageType, setMessageType] = useState('');

    // 선택된 템플릿
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // 메세지 내용
    const [messageContent, setMessageContent] = useState('');

    // 필터 상태
    const [filters, setFilters] = useState({
        preferredService: '',
        customerGrade: '',
        visitPeriod: '',
        ageGroup: ''
    });

    // 전체 단계 수 계산
    const getTotalSteps = () => {
        return 3; // 고정 4단계
    };

    // 메세지 유형 선택 처리
    const handleMessageTypeSelect = (type) => {
        setMessageType(type);
        nextStep();
        setSelectedTemplate(null);
        setMessageContent('');
    };

    // 템플릿 선택 처리
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        nextStep();
    };

    // 메세지 작성 완료 처리
    const handleMessageComplete = (content) => {
        setMessageContent(content);
        nextStep();
    };

    // 다음 단계로 이동
    const nextStep = () => {
        if (currentStep < getTotalSteps()) {
            setCurrentStep(currentStep + 1);
        }
    };

    // 이전 단계로 이동
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // 즉시 발송 처리
    const handleImmediateSend = () => {
        const clientCode = recipientSelection.clientCode;

        showConfirm(
            '메세지 발송',
            `선택된 ${recipientSelection.name}님에게 메세지를 발송하시겠습니까?`,
            async () => {
                try {
                    const messageData = {
                        messageContent: getMessageContent(),
                        clientCodes: [clientCode],
                        shopCode: SHOP_ID,
                        subject: generateSubject(),
                        isScheduled: false
                    };

                    console.log('발송 데이터:', messageData);

                    const result = await sendMessage(messageData);

             //       showSuccess('발송 접수 완료', '메세지가 성공적으로 접수되었습니다.\n발송은 순차적으로 처리됩니다.');
                    showSuccess(
                    '발송 접수 완료', 
                    '메세지가 성공적으로 접수되었습니다.\n발송은 순차적으로 처리됩니다.',
                    resetAndClose  // 성공 모달의 확인 버튼 클릭 시 실행될 콜백
                );

                  //  resetAndClose();

                } catch (error) {
                    showError('발송 실패', '메세지 발송 중 오류가 발생했습니다.\n다시 시도해주세요.');
                }
            }
        );
    };

    const sendMessage = async (messageData) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/my-shops/${SHOP_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error('메세지 발송에 실패했습니다.');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || '메세지 발송에 실패했습니다.');
            }

            return result.data;
        } catch (error) {
            console.error('메세지 발송 오류:', error);
            throw error;
        }
    };

    // 예약 발송 처리
    const handleScheduledSend = () => {
        showSuccess('예약 설정', '예약 발송 기능은 추후 구현 예정입니다.');
    };

    // 폼 초기화 및 모달 닫기
    const resetAndClose = () => {
        resetForm();
        onClose();
    };

    // 폼 초기화
    const resetForm = () => {
        setCurrentStep(1);
        setMessageType('');
        setSelectedTemplate(null);
        setMessageContent('');
        setFilters({
            preferredService: '',
            customerGrade: '',
            visitPeriod: '',
            ageGroup: ''
        });
    };

    // 제목 생성 함수
    const generateSubject = () => {
        if (messageType === 'template' && selectedTemplate) {
            return selectedTemplate.name;
        } else if (messageType === 'direct' && messageContent) {
            const cleanContent = messageContent.replace(/\n/g, ' ').trim();
            return cleanContent.length > 10 ? `${cleanContent.substring(0, 10)}...` : cleanContent;
        }
        return '메세지';
    };

    // 메세지 내용 생성 함수
    const getMessageContent = () => {
        if (messageType === 'template' && selectedTemplate) {
            return selectedTemplate.content;
        } else if (messageType === 'direct' && messageContent) {
            return messageContent;
        }
        return '';
    };

    // 단계 제목 가져오기
    const getStepTitle = (step) => {
        const titles = {
            1: '메세지 유형 선택',
            2: messageType === 'template' ? '템플릿 선택' : messageType === 'direct' ? '메세지 작성' : '메세지 설정',
            3: '발송 선택'
        };
        return titles[step] || '';
    };

    // 다음 단계 진행 가능 여부 확인
    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return messageType !== '';
            case 2:
                return messageType === 'template' ? selectedTemplate !== null : messageContent !== '';
            case 3:
                return true;
            default:
                return false;
        }
    };

    // 현재 단계에 따른 컴포넌트 렌더링 (단계별로 하나씩만 보여주기)
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <MessageTypeSelection
                        selectedType={messageType}
                        onTypeSelect={handleMessageTypeSelect}
                    />
                );
            case 2:
                if (messageType === 'template') {
                    return (
                        <TemplateSelection
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                        />
                    );
                } else if (messageType === 'direct') {
                    return (
                        <MessageCompose
                            content={messageContent}
                            onComplete={handleMessageComplete}
                        />
                    );
                } else {
                    return <div>메세지 유형을 먼저 선택해주세요.</div>;
                }
            case 3:
                return (
                    <SendOptions
                        recipientCount={1}
                        onImmediateSend={handleImmediateSend}
                        onScheduledSend={handleScheduledSend}
                    />
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modalOverlay} onClick={resetAndClose}>
                <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
                    {/* 모달 헤더 */}
                    <div className={styles.modalHeader}>
                        <div className={styles.headerContent}>
                            <h2 className={styles.modalTitle}>새 메세지 작성</h2>
                            <button className={styles.closeButton} onClick={resetAndClose}>
                                ✕
                            </button>
                        </div>
                        
                        {/* 진행 상태 표시 */}
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>
                                {currentStep}. {getStepTitle(currentStep)}
                            </span>
                        </div>
                    </div>

                    {/* 컨텐츠 - 현재 단계만 렌더링 */}
                    <div className={styles.modalContent}>
                        <div className={styles.stepContent}>
                            {renderCurrentStep()}
                        </div>
                    </div>

                    {/* 네비게이션 버튼 */}
                    <div className={styles.modalFooter}>
                        <button 
                            className={`${styles.navButton} ${styles.prev}`} // 🔧 CSS 클래스 수정
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            이전
                        </button>
                        
                        {currentStep < getTotalSteps() && (
                            <button 
                                className={`${styles.navButton} ${styles.next}`} // 🔧 CSS 클래스 수정
                                onClick={nextStep}
                                disabled={!canProceed()}
                            >
                                다음
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 메시지 모달 (확인/에러용) */}
            <MessageModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                showCancel={modal.showCancel}
            />
        </>
    );
}