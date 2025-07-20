'use client';

import styles from '@/styles/admin/message/SendOptions.module.css';

export default function SendOptions({ recipientCount, onImmediateSend, onScheduledSend }) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>4. 발송 선택</h2>
                <p className={styles.description}>
                    메세지 발송 방법을 선택해주세요
                </p>
            </div>

            {/* 발송 정보 요약 */}
            <div className={styles.summarySection}>
                <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>발송 준비 완료</h3>
                    <div className={styles.summaryInfo}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>수신자</span>
                            <span className={styles.summaryValue}>
                                <strong>{recipientCount}명</strong>
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>예상 비용</span>
                            <span className={styles.summaryValue}>
                                <strong>{(recipientCount * 20).toLocaleString()}원</strong>
                                <span className={styles.costDetail}>(건당 20원)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 발송 옵션 */}
            <div className={styles.optionsSection}>
                <div className={styles.optionCard}>
                    <div className={styles.optionIcon}>
                        <span className={styles.icon}>⚡</span>
                    </div>
                    <div className={styles.optionContent}>
                        <h3 className={styles.optionTitle}>즉시 발송</h3>
                        <p className={styles.optionDescription}>
                            메세지를 즉시 발송합니다.<br />
                            발송 후 취소할 수 없으니 신중히 선택해주세요.
                        </p>
                        <ul className={styles.optionFeatures}>
                            <li>즉시 발송</li>
                            <li>실시간 발송 현황 확인</li>
                            <li>발송 후 즉시 통계 확인</li>
                        </ul>
                    </div>
                    <div className={styles.optionAction}>
                        <button 
                            className={`${styles.optionButton} ${styles.immediateButton}`}
                            onClick={onImmediateSend}
                        >
                            즉시 발송
                        </button>
                    </div>
                </div>

                <div className={styles.optionCard}>
                    <div className={styles.optionIcon}>
                        <span className={styles.icon}>⏰</span>
                    </div>
                    <div className={styles.optionContent}>
                        <h3 className={styles.optionTitle}>예약 발송</h3>
                        <p className={styles.optionDescription}>
                            원하는 날짜와 시간을 설정하여 발송을 예약합니다.<br />
                            예약 전까지 언제든 수정하거나 취소할 수 있습니다.
                        </p>
                        <ul className={styles.optionFeatures}>
                            <li>날짜/시간 설정</li>
                            <li>발송 전 수정/취소 가능</li>
                            <li>반복 발송 설정</li>
                        </ul>
                    </div>
                    <div className={styles.optionAction}>
                        <button 
                            className={`${styles.optionButton} ${styles.scheduledButton}`}
                            onClick={onScheduledSend}
                        >
                            예약 발송
                        </button>
                    </div>
                </div>
            </div>

            {/* 주의사항 */}
            <div className={styles.noticeSection}>
                <div className={styles.noticeCard}>
                    <div className={styles.noticeIcon}>⚠️</div>
                    <div className={styles.noticeContent}>
                        <h4 className={styles.noticeTitle}>발송 전 확인사항</h4>
                        <ul className={styles.noticeList}>
                            <li>메세지 내용과 수신자 목록을 다시 한번 확인해주세요</li>
                            <li>발송된 메세지는 취소할 수 없습니다</li>
                            <li>광고성 메세지의 경우 수신 동의를 받은 고객에게만 발송됩니다</li>
                            <li>발송 비용은 즉시 차감됩니다</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}