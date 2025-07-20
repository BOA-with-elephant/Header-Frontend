'use client';

import { useState } from 'react';
import MessageSteps from '@/components/message/MessageSteps';
import MessageTypeSelection from '@/components/message/MessageTypeSelection';
import TemplateSelection from '@/components/message/TemplateSelection';
import MessageCompose from '@/components/message/MessageCompose';
import RecipientSelection from '@/components/message/RecipientSelection';
import SendOptions from '@/components/message/SendOptions';
import MessageModal from '@/components/ui/MessageModal';
import { useMessageModal } from '@/hooks/useMessageModal';
import styles from '@/styles/admin/message/Message.module.css';

export default function Message() {
    const { modal, closeModal, showError, showSuccess, showConfirm } = useMessageModal();

    // 현재 단계 상태
    const [currentStep, setCurrentStep] = useState(1);

    // 메세지 유형 상태 ('template' 또는 'direct')
    const [messageType, setMessageType] = useState('');

    // 선택된 템플릿
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // 메세지 내용
    const [messageContent, setMessageContent] = useState('');

    // 선택된 수신자들
    const [selectedRecipients, setSelectedRecipients] = useState([]);

    // 필터 상태
    const [filters, setFilters] = useState({
        preferredService: '',
        customerGrade: '',
        visitPeriod: '',
        ageGroup: ''
    });

    // 단계별 제목 생성
    const getStepTitles = () => {
        const titles = ['1. 메세지 유형 선택'];

        if (messageType === 'template') {
            titles.push('2. 템플릿 선택');
        } else if (messageType === 'direct') {
            titles.push('2. 메세지 작성');
        }

        if (messageType && (selectedTemplate || messageContent)) {
            titles.push('3. 수신자 선택');
        }

        if (selectedRecipients.length > 0) {
            titles.push('4. 발송 선택');
        }

        return titles;
    };

    // 메세지 유형 선택 처리
    const handleMessageTypeSelect = (type) => {
        setMessageType(type);
        setCurrentStep(2);
        setSelectedTemplate(null);
        setMessageContent('');
    };

    // 템플릿 선택 처리
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setCurrentStep(3);
    };

    // 메세지 작성 완료 처리
    const handleMessageComplete = (content) => {
        setMessageContent(content);
        setCurrentStep(3);
    };

    // 수신자 선택 처리
    const handleRecipientSelect = (recipients) => {
        setSelectedRecipients(recipients);
    };

    const handleRecipientComplete = () => {
        if (selectedRecipients.length > 0) {
            setCurrentStep(4);
        }
    };

    // 즉시 발송 처리
    const handleImmediateSend = () => {
        showConfirm(
            '메세지 발송',
            `선택된 ${selectedRecipients.length}명에게 메세지를 발송하시겠습니까?`,
            () => {
                // TODO: 실제 발송 API 호출
                console.log('메세지 발송:', {
                    type: messageType,
                    template: selectedTemplate,
                    content: messageContent,
                    recipients: selectedRecipients
                });
                showSuccess('발송 완료', '메세지가 성공적으로 발송되었습니다.');
                // 초기화
                resetForm();
            }
        );
    };

    // 예약 발송 처리
    const handleScheduledSend = () => {
        // TODO: 예약 발송 모달 구현
        showSuccess('예약 설정', '예약 발송 기능은 추후 구현 예정입니다.');
    };

    // 폼 초기화
    const resetForm = () => {
        setCurrentStep(1);
        setMessageType('');
        setSelectedTemplate(null);
        setMessageContent('');
        setSelectedRecipients([]);
        setFilters({
            preferredService: '',
            customerGrade: '',
            visitPeriod: '',
            ageGroup: ''
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>새 메세지 작성</h1>

            <div className={styles.content}>
                {/* 좌측 단계 네비게이션 */}
                <div className={styles.sidebar}>
                    <MessageSteps
                        steps={getStepTitles()}
                        currentStep={currentStep}
                        onStepClick={setCurrentStep}
                    />
                </div>

                {/* 우측 메인 컨텐츠 */}
                <div className={styles.mainContent}>
                    {currentStep === 1 && (
                        <MessageTypeSelection
                            selectedType={messageType}
                            onTypeSelect={handleMessageTypeSelect}
                        />
                    )}

                    {currentStep === 2 && messageType === 'template' && (
                        <TemplateSelection
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                        />
                    )}

                    {currentStep === 2 && messageType === 'direct' && (
                        <MessageCompose
                            content={messageContent}
                            onComplete={handleMessageComplete}
                        />
                    )}

                    {currentStep === 3 && (
                        <RecipientSelection
                            selectedRecipients={selectedRecipients}
                            filters={filters}
                            onFiltersChange={setFilters}
                            onRecipientsChange={handleRecipientSelect} // 자동 이동 없음
                            onComplete={handleRecipientComplete} // 완료 버튼용
                        />
                    )}

                    {currentStep === 4 && (
                        <SendOptions
                            recipientCount={selectedRecipients.length}
                            onImmediateSend={handleImmediateSend}
                            onScheduledSend={handleScheduledSend}
                        />
                    )}
                </div>
            </div>

            {/* 메시지 모달 */}
            <MessageModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                showCancel={modal.showCancel}
            />
        </div>
    );
}