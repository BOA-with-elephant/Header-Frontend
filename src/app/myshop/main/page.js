"use client";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/context/UserContext";
import styles from "../../../styles/admin/Dashboard.module.css";

import MessageModal from '@/components/ui/MessageModal';  // 성공, 실패, 경고, 확인 등의 메시지를 사용자에게 표시하는 공통 모달 컴포넌트
import { useMessageModal } from '@/hooks/useMessageModal'; // 메시지 모달 상태를 관리하고 제어하는 커스텀 훅
// showError, showSuccess, showConfirm, showWarning 등을 통해 상황별 메시지를 간편하게 호출 가능
import { MESSAGES } from '@/constants/messages'; // 애플리케이션 전반에서 사용하는 표준 메시지 텍스트 모음 (예: 에러 메시지, 안내 문구 등)

export default function AdminMain() {
    const userInfo = useContext(UserContext);
    const [dashboardData, setDashboardData] = useState({
        todayReservations: 0,
        todaySales: 0,
        completedServices: 0,
        monthlyReservations: 0,
        monthlySales: 0,
        pendingReservations: 0,
        newCustomers: 0,
        isLoading: true
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 실제 API 호출로 교체 예정
                const mockData = {
                    todayReservations: 8,
                    todaySales: 245000,
                    completedServices: 6,
                    monthlyReservations: 156,
                    monthlySales: 5240000,
                    pendingReservations: 3,
                    newCustomers: 12
                };

                setTimeout(() => {
                    setDashboardData({ ...mockData, isLoading: false });
                }, 1000);

            } catch (error) {
                console.error('대시보드 데이터 로드 실패:', error);
                setDashboardData(prev => ({ ...prev, isLoading: false }));
            }
        };

        loadDashboardData();
    }, []);

    const formatNumber = (num) => num.toLocaleString('ko-KR');

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    const getCurrentClock = () => {
        const now = new Date();
        return now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (dashboardData.isLoading) {
        return (
            <div className={styles.contentCard}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div>대시보드를 불러오는 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contentCard}>
            {/* 헤더 */}
            <div className={styles.dashboardHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.mainTitle}>관리자 대시보드</h1>
                        <p className={styles.mainSubtitle}>{getCurrentTime()}</p>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.currentTime}>
                            <span className={styles.timeLabel}>현재 시간</span>
                            <div className={styles.timeValue}>{getCurrentClock()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오늘의 핵심 지표 */}
            <div className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>오늘의 핵심 지표</h2>
                <div className={styles.statsGrid}>
                    {[
                        {
                            icon: "📅",
                            title: "오늘 예약",
                            value: dashboardData.todayReservations,
                            unit: "건",
                            badge: "+12%",
                            link: "/myshop/reservation-list",
                            style: styles.statCardPrimary,
                            linkText: "예약 목록 보기 →"
                        },
                        {
                            icon: "💰",
                            title: "오늘 매출",
                            value: dashboardData.todaySales,
                            unit: "원",
                            badge: "+8%",
                            link: "/myshop/sales",
                            style: styles.statCardSuccess,
                            linkText: "매출 상세 보기 →"
                        },
                        {
                            icon: "✅",
                            title: "완료된 시술",
                            value: dashboardData.completedServices,
                            unit: "건",
                            badge: "+5%",
                            link: "/myshop/customer-list",
                            style: styles.statCardInfo,
                            linkText: "시술 내역 보기 →"
                        },
                        {
                            icon: "⏰",
                            title: "대기 예약",
                            value: dashboardData.pendingReservations,
                            unit: "건",
                            badge: `${dashboardData.pendingReservations}`,
                            link: "/myshop/reservation-list?status=pending",
                            style: styles.statCardWarning,
                            linkText: "확인하기 →"
                        }
                    ].map((stat, index) => (
                        <div key={index} className={`${styles.statCard} ${stat.style}`}>
                            <div className={styles.statIcon}>{stat.icon}</div>
                            <div className={styles.statContent}>
                                <div className={styles.statHeader}>
                                    <h3 className={styles.statTitle}>{stat.title}</h3>
                                    <span className={styles.statBadge}>{stat.badge}</span>
                                </div>
                                <p className={styles.statNumber}>
                                    {formatNumber(stat.value)}
                                    <span className={styles.statUnit}> {stat.unit}</span>
                                </p>
                                <Link href={stat.link} className={styles.statLink}>
                                    {stat.linkText}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 이번 달 현황 */}
            <div className={styles.mainContentGrid}>
                <div className={styles.monthlyStats}>
                    <h3 className={styles.sectionTitle}>이번 달 현황</h3>
                    <div className={styles.monthlyStatsGrid}>
                        {[
                            {
                                icon: "📊",
                                label: "총 예약",
                                subLabel: "월 누적",
                                value: dashboardData.monthlyReservations,
                                unit: "건",
                                growth: "+15% 증가"
                            },
                            {
                                icon: "💎",
                                label: "총 매출",
                                subLabel: "월 누적",
                                value: dashboardData.monthlySales,
                                unit: "원",
                                growth: "+22% 증가"
                            },
                            {
                                icon: "👥",
                                label: "신규 고객",
                                subLabel: "이번 달",
                                value: dashboardData.newCustomers,
                                unit: "명",
                                growth: "+35% 증가"
                            }
                        ].map((stat, idx) => (
                            <div key={idx} className={styles.monthlyStatItem}>
                                <div className={styles.monthlyStatIcon}>{stat.icon}</div>
                                <div className={styles.monthlyStatContent}>
                                    <div className={styles.monthlyStatLeft}>
                                        <p className={styles.monthlyStatLabel}>
                                            {stat.label} <span className={styles.monthlyStatSubLabel}>{stat.subLabel}</span>
                                        </p>
                                    </div>
                                    <div className={styles.monthlyStatRight}>
                                        <p className={styles.monthlyStatNumber}>
                                            {formatNumber(stat.value)}<span className={styles.statUnit}> {stat.unit}</span>
                                        </p>
                                        <p className={styles.monthlyStatGrowth}>{stat.growth}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 빠른 액션 */}
                <div className={styles.quickActionsSection}>
                    <h3 className={styles.sectionTitle}>빠른 작업</h3>
                    <div className={styles.quickActions}>
                        {[
                            {
                                icon: "➕",
                                title: "새 예약 등록",
                                desc: "고객 예약을 빠르게 등록하세요",
                                link: "/myshop/reservation",
                                style: styles.actionCardPrimary
                            },
                            {
                                icon: "👤",
                                title: "고객 관리",
                                desc: "고객 정보를 조회하고 관리하세요",
                                link: "/myshop/customer",
                                style: styles.actionCardSuccess
                            },
                            {
                                icon: "💳",
                                title: "매출 관리",
                                desc: "매출 현황을 확인하고 분석하세요",
                                link: "/myshop/sales",
                                style: styles.actionCardInfo
                            },
                            {
                                icon: "📈",
                                title: "분석 리포트",
                                desc: "비즈니스 통계와 트렌드를 확인하세요",
                                link: "/myshop/analytics",
                                style: styles.actionCardWarning
                            }
                        ].map((action, index) => (
                            <Link key={index} href={action.link} className={`${styles.actionCard} ${action.style}`}>
                                <div className={styles.actionIcon}>{action.icon}</div>
                                <div className={styles.actionContent}>
                                    <h4 className={styles.actionTitle}>{action.title}</h4>
                                    <p className={styles.actionDescription}>{action.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 하단 알림 */}
            <div className={styles.notificationCard}>
                <div className={styles.notificationIcon}>💡</div>
                <div className={styles.notificationContent}>
                    <p className={styles.notificationTitle}>오늘의 할 일</p>
                    <p className={styles.notificationDescription}>
                        대기 중인 예약 {dashboardData.pendingReservations}건이 있습니다. 확인해주세요.
                    </p>
                </div>
            </div>
        </div>
    );
}