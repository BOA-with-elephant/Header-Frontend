'use client';

import styles from '@/styles/chat/AssistantSelector.module.css';

/**
 * Render an assistant selection UI with a role-aware header, optional user greeting, a grid of assistant cards, and a role-specific footer tip.
 *
 * Each assistant card shows an icon, name, and description, applies the assistant's color via a CSS custom property, and calls `onSelect(assistant)` when clicked.
 *
 * @param {Object[]} assistants - Array of assistant objects. Each object is expected to include { id, color, icon, name, description }.
 * @param {Function} onSelect - Callback invoked with the selected assistant object when a card is clicked.
 * @param {number} userRole - Role identifier that controls displayed copy: 2 = owner, 1 = regular user, otherwise guest.
 * @param {Object} [userInfo] - Optional user information; used to render a greeting. Expected properties: { shopName?, userName? }.
 * @param {*} [welcomeMessage] - Accepted but currently unused.
 * @returns {JSX.Element} The rendered AssistantSelector component.
 */
export default function AssistantSelector({ 
    assistants, 
    onSelect, 
    userRole, 
    userInfo, 
    welcomeMessage 
}) {
    // 권한별 제목 설정
    const getTitle = () => {
        if (userRole === 2) {
            return '사장님, 어떤 도움이 필요하세요?';
        } else if (userRole === 1) {
            return '어떤 도움이 필요하세요?';
        } else {
            return '헤더 서비스 안내';
        }
    };

    // 권한별 서브타이틀 설정
    const getSubtitle = () => {
        if (userRole === 2) {
            return '비즈니스 관리를 위한 도우미를 선택해주세요';
        } else if (userRole === 1) {
            return '원하는 서비스를 선택해주세요';
        } else {
            return '서비스 이용을 위한 안내를 받아보세요';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{getTitle()}</h3>
                <p className={styles.subtitle}>{getSubtitle()}</p>
                
                {/* 사용자 정보 표시 */}
                {userInfo && (
                    <div className={styles.userInfo}>
                        <span className={styles.userGreeting}>
                            {userRole === 2 
                                ? `${userInfo.shopName || '사장님'} 안녕하세요!` 
                                : `${userInfo.userName || '고객님'} 안녕하세요!`
                            }
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.assistantGrid}>
                {assistants.map((assistant) => (
                    <button
                        key={assistant.id}
                        className={styles.assistantCard}
                        onClick={() => onSelect(assistant)}
                        style={{ '--assistant-color': assistant.color }}
                    >
                        <div className={styles.assistantIcon}>
                            {assistant.icon}
                        </div>
                        <div className={styles.assistantInfo}>
                            <h4 className={styles.assistantName}>
                                {assistant.name}
                            </h4>
                            <p className={styles.assistantDescription}>
                                {assistant.description}
                            </p>
                        </div>
                        <div className={styles.selectArrow}>
                            →
                        </div>
                    </button>
                ))}
            </div>

            <div className={styles.footer}>
                <p className={styles.footerText}>
                    {userRole === 2 
                        ? '💡 언제든지 다른 도우미로 변경할 수 있어요'
                        : userRole === 1 
                        ? '💡 편리한 서비스 이용을 위해 도와드려요'
                        : '💡 회원가입 후 더 많은 서비스를 이용하세요'
                    }
                </p>
            </div>
        </div>
    );
}
