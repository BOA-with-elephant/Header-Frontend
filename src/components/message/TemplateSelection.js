'use client';

import { useState, useEffect } from 'react';
import { MessagesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import styles from '@/styles/admin/message/TemplateSelection.module.css';

export default function TemplateSelection({ userInfo,selectedTemplate, onTemplateSelect }) {
    // 템플릿 카테고리
    const [selectedCategory, setSelectedCategory] = useState('promotional');
    
    // 템플릿 데이터 상태
    const [templates, setTemplates] = useState({
        promotional: [],
        informational: []
    });
    
    // API 호출용 훅
    const { execute: executeApi, loading } = useApi();

    // shop_id를 context나 store에서 가져오도록 수정
    const SHOP_ID = userInfo?.shopCode || 1;

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
                    transformedTemplates[categoryType] = categoryData.templates.map((template, index) => ({
                        id: `${categoryType}_${index + 1}`,
                        name: template.title,
                        content: template.content,
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
            // 에러 발생 시 빈 데이터로 설정
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

    const categories = [
        { id: 'promotional', name: '프로모션', icon: '🎯' }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>2. 템플릿 선택</h2>
                <p className={styles.description}>
                    사용할 메세지 템플릿을 선택해주세요
                </p>
            </div>

            {/* 카테고리 탭 */}
            <div className={styles.categoryTabs}>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`${styles.categoryTab} ${
                            selectedCategory === category.id ? styles.active : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                        disabled={loading}
                    >
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        <span className={styles.categoryName}>{category.name}</span>
                    </button>
                ))}
            </div>

            {/* 로딩 상태 */}
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.loadingSpinner}></div>
                    <span>템플릿을 불러오는 중...</span>
                </div>
            ) : (
                <>
                    {/* 템플릿 목록 */}
                    <div className={styles.templateGrid}>
                        {templates[selectedCategory]?.map((template) => (
                            <div
                                key={template.id}
                                className={`${styles.templateCard} ${
                                    selectedTemplate?.id === template.id ? styles.selected : ''
                                }`}
                                onClick={() => onTemplateSelect(template)}
                            >
                                <div className={styles.templateHeader}>
                                    <h3 className={styles.templateName}>{template.name}</h3>
                                </div>
                                
                                <div className={styles.templateContent}>
                                    <p className={styles.templatePreview}>
                                        {template.content.length > 100 
                                            ? `${template.content.substring(0, 100)}...`
                                            : template.content
                                        }
                                    </p>
                                </div>

                                <div className={styles.templateFooter}>
                                    <span className={styles.templateCategory}>
                                        {template.category}
                                    </span>
                                    <button className={styles.selectButton}>
                                        {selectedTemplate?.id === template.id ? '선택됨' : '선택하기'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {templates[selectedCategory]?.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h3 className={styles.emptyTitle}>템플릿이 없습니다</h3>
                            <p className={styles.emptyDescription}>
                                해당 카테고리에 등록된 템플릿이 없습니다.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
