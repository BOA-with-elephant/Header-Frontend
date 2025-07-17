'use client';
import styles from '@/styles/admin/customer/CustomerCard.module.css';

export default function CustomerCard({ customer, onAction, onClick }) {
    // 금액 포맷팅
    const formatCurrency = (amount) => {
        return `₩ ${amount.toLocaleString()}`;
    };

    // 액션 버튼 클릭 핸들러 (이벤트 전파 방지)
    const handleActionClick = (action, event) => {
        event.stopPropagation(); // 이벤트 전파 방지
        event.preventDefault();
        onAction(customer.id, action, event);
    };

    return (
        <div 
            className={styles.customerCard}
            onClick={onClick}
        >
            <div className={styles.customerHeader}>
                <div className={styles.customerProfile}>
                    <div className={styles.profileAvatar}>
                        <div className={styles.avatarPlaceholder}></div>
                    </div>
                    <div className={styles.customerInfo}>
                        <div className={styles.customerNameRow}>
                            <span className={styles.customerName}>{customer.name}</span>
                            {customer.isVip && <span className={styles.vipBadge}>VIP</span>}
                        </div>
                        <span className={styles.customerPhone}>{customer.phone}</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.customerStats}>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>마지막 방문</span>
                    <span className={styles.statValue}>{customer.lastVisit}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>총 방문횟수</span>
                    <span className={styles.statValue}>{customer.visitCount}회</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>총 결제금액</span>
                    <span className={styles.statValue}>{formatCurrency(customer.totalAmount)}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>선호 서비스</span>
                    <span className={styles.statValue}>{customer.preferredServices.join(', ')}</span>
                </div>
            </div>
            
            <div className={styles.customerActions}>
                <button 
                    className={`${styles.actionBtn} ${styles.reservationBtn}`}
                    onClick={(e) => handleActionClick('reservation', e)}
                >
                    예약
                </button>
                <button 
                    className={`${styles.actionBtn} ${styles.historyBtn}`}
                    onClick={(e) => handleActionClick('history', e)}
                >
                    히스토리
                </button>
                <button 
                    className={`${styles.actionBtn} ${styles.messageBtn}`}
                    onClick={(e) => handleActionClick('message', e)}
                >
                    메세지 발송
                </button>
            </div>
        </div>
    );
}