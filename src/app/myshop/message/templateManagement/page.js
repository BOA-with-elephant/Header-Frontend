'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useMessageModal } from '@/hooks/useMessageModal';
import TemplateCard from '@/components/message/TemplateCard';
import TemplateAddModal from '@/components/message/TemplateAddModal';
import TemplateEditModal from '@/components/message/TemplateEditModal';
import MessageModal from '@/components/ui/MessageModal';
import styles from '@/styles/admin/message/TemplateManagement.module.css';

export default function TemplateManagement() {
    const router = useRouter();
    const { modal, closeModal, showError, showSuccess, showConfirm } = useMessageModal();
    
    // API 호출용 훅
    const { execute: executeApi, loading: apiLoading } = useApi();

    // 템플릿 데이터 상태
    const [templates, setTemplates] = useState({
        promotional: [],
        informational: []
    });

    // 모달 상태
    const [addModal, setAddModal] = useState({
        isOpen: false,
        type: 'promotional'
    });

    const [editModal, setEditModal] = useState({
        isOpen: false,
        template: null
    });

    // TODO: shop_id를 context나 store에서 가져오도록 수정
    const SHOP_ID = 2;

    // API 데이터를 내부 형식으로 변환
    const transformApiData = (apiData) => {
        const transformedTemplates = {
            promotional: [],
            informational: []
        };

        if (Array.isArray(apiData)) {
            apiData.forEach(categoryData => {
                const categoryType = categoryData.type;
                if (transformedTemplates[categoryType]) {
                    transformedTemplates[categoryType] = categoryData.templates.map((template) => ({
                        id: template.templateCode,
                        templateCode: template.templateCode,
                        title: template.title,
                        content: template.content,
                        type: categoryType,
                        category: categoryType === 'promotional' ? '프로모션' : '알림',
                    }));
                }
            });
        }

        return transformedTemplates;
    };

    // 템플릿 목록 조회 (새로운 API 패턴 사용)
    const fetchTemplates = async () => {
        try {
            const response = await executeApi(MessagesAPI.getTemplates, SHOP_ID);
            const transformedData = transformApiData(response.data || []);
            setTemplates(transformedData);
        } catch (error) {
            console.error('템플릿 목록 조회 오류:', error);
            showError('오류', '템플릿 목록을 불러오는데 실패했습니다.');
            setTemplates({
                promotional: [],
                informational: []
            });
        }
    };

    // 컴포넌트 마운트 시 템플릿 데이터 로드
    useEffect(() => {
        fetchTemplates();
    }, []);

    // 템플릿 추가 모달 열기
    const handleAddTemplate = (type = 'promotional') => {
        setAddModal({
            isOpen: true,
            type: type
        });
    };

    // 템플릿 추가 모달 닫기
    const handleAddModalClose = () => {
        setAddModal({
            isOpen: false,
            type: 'promotional'
        });
    };

    // 템플릿 추가 처리 (새로운 API 패턴 사용)
    const handleTemplateAdd = async (templateData) => {
        try {
            await executeApi(MessagesAPI.createTemplate, SHOP_ID, templateData);
            await fetchTemplates();
            handleAddModalClose();
            showSuccess('추가 완료', '새 템플릿이 성공적으로 추가되었습니다.');
        } catch (error) {
            showError('추가 실패', '템플릿 추가 중 오류가 발생했습니다.');
        }
    };

    // 템플릿 수정 모달 열기
    const handleEditTemplate = (template) => {
        setEditModal({
            isOpen: true,
            template: template
        });
    };

    // 템플릿 수정 모달 닫기
    const handleEditModalClose = () => {
        setEditModal({
            isOpen: false,
            template: null
        });
    };

    // 템플릿 수정 처리 (새로운 API 패턴 사용)
    const handleTemplateEdit = async (templateData) => {
        try {
            await executeApi(MessagesAPI.updateTemplate, SHOP_ID, templateData);
            await fetchTemplates();
            handleEditModalClose();
            showSuccess('수정 완료', '템플릿이 성공적으로 수정되었습니다.');
        } catch (error) {
            showError('수정 실패', '템플릿 수정 중 오류가 발생했습니다.');
        }
    };

    // 템플릿 삭제 처리 (새로운 API 패턴 사용)
    const handleDeleteTemplate = (template) => {
        showConfirm(
            '템플릿 삭제',
            `"${template.title}" 템플릿을 정말 삭제하시겠습니까?`,
            async () => {
                try {
                    await executeApi(MessagesAPI.deleteTemplate, SHOP_ID, template.templateCode);
                    await fetchTemplates();
                    showSuccess('삭제 완료', '템플릿이 성공적으로 삭제되었습니다.');
                } catch (error) {
                    showError('삭제 실패', '템플릿 삭제 중 오류가 발생했습니다.');
                }
            }
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>템플릿 관리</h1>
                <button
                    className={styles.addButton}
                    onClick={() => router.push('/myshop/message')}
                >
                    + 새 메세지 작성
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.templateSection}>
                    <h2 className={styles.sectionTitle}>사용자 템플릿</h2>

                    {apiLoading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.loadingSpinner}></div>
                            <span>템플릿을 불러오는 중...</span>
                        </div>
                    ) : (
                        <>
                            {/* 프로모션 템플릿 */}
                            <div className={styles.categorySection}>
                                <div className={styles.categoryHeader}>
                                    <h3 className={styles.categoryTitle}>프로모션</h3>
                                    <button
                                        className={styles.categoryAddButton}
                                        onClick={() => handleAddTemplate('promotional')}
                                        disabled={apiLoading}
                                    >
                                        + 추가
                                    </button>
                                </div>

                                <div className={styles.templateGrid}>
                                    {templates.promotional.length > 0 ? (
                                        templates.promotional.map((template) => (
                                            <TemplateCard
                                                key={template.id}
                                                template={template}
                                                onEdit={() => handleEditTemplate(template)}
                                                onDelete={() => handleDeleteTemplate(template)}
                                            />
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>📝</div>
                                            <p className={styles.emptyText}>등록된 프로모션 템플릿이 없습니다</p>
                                            <button
                                                className={styles.emptyAddButton}
                                                onClick={() => handleAddTemplate('promotional')}
                                                disabled={apiLoading}
                                            >
                                                첫 번째 템플릿 만들기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 알림 템플릿 */}
                            <div className={styles.categorySection}>
                                <div className={styles.categoryHeader}>
                                    <h3 className={styles.categoryTitle}>알림</h3>
                                </div>

                                <div className={styles.templateGrid}>
                                    {templates.informational.length > 0 ? (
                                        templates.informational.map((template) => (
                                            <TemplateCard
                                                key={template.id}
                                                template={template}
                                            />
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>🔔</div>
                                            <p className={styles.emptyText}>등록된 알림 템플릿이 없습니다</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 템플릿 추가 모달 */}
            <TemplateAddModal
                isOpen={addModal.isOpen}
                onClose={handleAddModalClose}
                onConfirm={handleTemplateAdd}
                type={addModal.type}
            />

            {/* 템플릿 수정 모달 */}
            <TemplateEditModal
                isOpen={editModal.isOpen}
                onClose={handleEditModalClose}
                onConfirm={handleTemplateEdit}
                template={editModal.template}
            />

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
