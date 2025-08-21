'use client';

import styles from '@/styles/chat/QuickActions.module.css';

export default function QuickActions({ actions, onActionClick, assistantColor }) {
    if (!actions || actions.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.label}>빠른 액션</div>
            <div className={styles.actionsGrid}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={styles.actionButton}
                        onClick={() => onActionClick(action.message)}
                        style={{ '--assistant-color': assistantColor }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}