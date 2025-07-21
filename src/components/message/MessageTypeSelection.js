'use client';

import styles from '@/styles/admin/message/MessageTypeSelection.module.css';

export default function MessageTypeSelection({ selectedType, onTypeSelect }) {
    const messageTypes = [
        {
            id: 'template',
            title: '템플릿 사용',
            description: '미리 만들어진 템플릿을 사용하여 메세지를 작성합니다',
            icon: '📋'
        },
        {
            id: 'direct',
            title: '직접 작성',
            description: '메세지를 직접 작성합니다',
            icon: '✏️'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>1. 메세지 유형 선택</h2>
                <p className={styles.description}>
                    메세지 작성 방법을 선택해주세요
                </p>
            </div>

            <div className={styles.typeGrid}>
                {messageTypes.map((type) => (
                    <div
                        key={type.id}
                        className={`${styles.typeCard} ${
                            selectedType === type.id ? styles.selected : ''
                        }`}
                        onClick={() => onTypeSelect(type.id)}
                    >
                        <div className={styles.cardIcon}>
                            <span className={styles.icon}>{type.icon}</span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{type.title}</h3>
                            <p className={styles.cardDescription}>{type.description}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <button className={styles.selectButton}>
                                {selectedType === type.id ? '선택됨' : '선택하기'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}