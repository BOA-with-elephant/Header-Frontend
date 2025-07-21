'use client';

import { useState } from 'react';
import styles from '@/styles/admin/message/TemplateSelection.module.css';

export default function TemplateSelection({ selectedTemplate, onTemplateSelect }) {
    // 템플릿 카테고리
    const [selectedCategory, setSelectedCategory] = useState('promotional');

    // 템플릿 데이터 (실제로는 API에서 가져올 데이터)
    const templates = {
        promotional: [
            {
                id: 1,
                name: '할인 이벤트',
                content: '안녕하세요 {고객명}님! 🎉\n\n특별 할인 이벤트를 진행합니다.\n{서비스명} 20% 할인!\n\n기간: {시작일} ~ {종료일}\n예약 문의: {연락처}',
                category: '프로모션',
                usageCount: 152
            },
            {
                id: 2,
                name: '신규 서비스 안내',
                content: '{고객명}님께 새로운 서비스를 소개합니다! ✨\n\n{서비스명}이 새롭게 출시되었습니다.\n특별 런칭 이벤트로 30% 할인 제공!\n\n자세한 내용은 매장으로 문의해주세요.',
                category: '프로모션',
                usageCount: 89
            }
        ],
        informational: [
            {
                id: 3,
                name: '예약 알림',
                content: '안녕하세요 {고객명}님!\n\n예약 일정을 안내드립니다.\n📅 날짜: {예약일}\n⏰ 시간: {예약시간}\n💇 서비스: {서비스명}\n\n문의사항이 있으시면 연락주세요.',
                category: '알림',
                usageCount: 234
            },
            {
                id: 4,
                name: '방문 감사',
                content: '{고객명}님, 오늘 방문해주셔서 감사합니다! 😊\n\n{서비스명} 만족스러우셨나요?\n다음 방문도 기다리겠습니다.\n\n궁금한 점이 있으시면 언제든 연락주세요!',
                category: '알림',
                usageCount: 167
            }
        ]
    };

    const categories = [
        { id: 'informational', name: '알림', icon: '🔔' },
        { id: 'promotional', name: '프로모션', icon: '🎯' },
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
                    >
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        <span className={styles.categoryName}>{category.name}</span>
                    </button>
                ))}
            </div>

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
        </div>
    );
}