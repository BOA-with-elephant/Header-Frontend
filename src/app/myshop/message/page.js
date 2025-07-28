'use client';

import { useState } from 'react';
import { MessagesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useMessageModal } from '@/hooks/useMessageModal';
import MessageSteps from '@/components/message/MessageSteps';
import MessageTypeSelection from '@/components/message/MessageTypeSelection';
import TemplateSelection from '@/components/message/TemplateSelection';
import MessageCompose from '@/components/message/MessageCompose';
import RecipientSelection from '@/components/message/RecipientSelection';
import SendOptions from '@/components/message/SendOptions';
import MessageModal from '@/components/ui/MessageModal';
import styles from '@/styles/admin/message/Message.module.css';

export default function Message() {
    const { modal, closeModal, showError, showSuccess, showConfirm } = useMessageModal();
    
    // API 호출용 훅
    const { execute: executeApi, loading: apiLoading } = useApi();

    // 임시 shopId (실제로는 context나 store에서 가져와야 함)
    const SHOP_ID = 1;

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

    // 즉시 발송 처리 (새로운 API 패턴 사용)
    const handleImmediateSend = () => {
        const clientCodes = selectedRecipients.map(recipient => recipient.clientCode);

        showConfirm(
            '메세지 발송',
            `선택된 ${selectedRecipients.length}명에게 메세지를 발송하시겠습니까?`,
            async () => {
                try {
                    const messageData = {
                        messageContent: getMessageContent(),
                        clientCodes: clientCodes,
                        shopCode: SHOP_ID,
                        subject: generateSubject(),
                        isScheduled: false
                    };

                    console.log('발송 데이터:', messageData);

                    // 새로운 API 패턴 사용
                    await executeApi(MessagesAPI.sendMessage, SHOP_ID, messageData);

                    showSuccess('발송 접수 완료', '메세지가 성공적으로 접수되었습니다.\n발송은 순차적으로 처리됩니다.');

                    resetForm();

                } catch (error) {
                    showError('발송 실패', '메세지 발송 중 오류가 발생했습니다.\n다시 시도해주세요.');
                }
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
                            onRecipientsChange={handleRecipientSelect}
                            onComplete={handleRecipientComplete}
                        />
                    )}

                    {currentStep === 4 && (
                        <SendOptions
                            recipientCount={selectedRecipients.length}
                            onImmediateSend={handleImmediateSend}
                            onScheduledSend={handleScheduledSend}
                            loading={apiLoading}
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
