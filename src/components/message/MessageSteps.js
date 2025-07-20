'use client';

import styles from '@/styles/admin/message/MessageSteps.module.css';

export default function MessageSteps({ steps, currentStep, onStepClick }) {
    return (
        <div className={styles.stepsContainer}>
            <h3 className={styles.stepsTitle}>새 메세지 작성</h3>
            <ul className={styles.stepsList}>
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    const isClickable = stepNumber <= currentStep;

                    return (
                        <li 
                            key={stepNumber}
                            className={`${styles.stepItem} ${
                                isActive ? styles.active : ''
                            } ${isCompleted ? styles.completed : ''} ${
                                isClickable ? styles.clickable : ''
                            }`}
                            onClick={() => isClickable && onStepClick(stepNumber)}
                        >
                            <div className={styles.stepContent}>
                                <div className={styles.stepIndicator}>
                                    {isCompleted ? (
                                        <span className={styles.checkIcon}>✓</span>
                                    ) : (
                                        <span className={styles.stepNumber}>{stepNumber}</span>
                                    )}
                                </div>
                                <span className={styles.stepText}>{step}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}