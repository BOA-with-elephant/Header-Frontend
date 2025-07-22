'use client';

import styles from '@/styles/admin/message/TemplateCard.module.css';

export default function TemplateCard({ template, onEdit, onDelete }) {
    const getCategoryBadge = () => {
        if (template.type === 'promotional') {
            return <span className={`${styles.categoryBadge} ${styles.promotional}`}>프로모션</span>;
        } else {
            return <span className={`${styles.categoryBadge} ${styles.informational}`}>알림</span>;
        }
    };

    const getPreviewContent = () => {
        if (template.content.length > 80) {
            return template.content.substring(0, 80) + '...';
        }
        return template.content;
    };

    return (
        <div className={styles.templateCard}>
            <div className={styles.cardHeader}>
                <div className={styles.titleSection}>
                    <h4 className={styles.templateTitle}>{template.title}</h4>
                    {getCategoryBadge()}
                </div>
                {(onEdit || onDelete) && (
                    <div className={styles.actionButtons}>
                        {onEdit && (
                            <button 
                                className={styles.editButton}
                                onClick={onEdit}
                                title="수정"
                            >
                                ✏️
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                className={styles.deleteButton}
                                onClick={onDelete}
                                title="삭제"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.cardContent}>
                <p className={styles.templateContent}>{getPreviewContent()}</p>
            </div>

        </div>
    );
}