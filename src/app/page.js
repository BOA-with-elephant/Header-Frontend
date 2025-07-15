"use client";
import Link from "next/link";
import styles from "../styles/common/LandingPage.module.css"; // ✨ 랜딩페이지 전용 CSS

export default function Home() {
  return (
    <div className={styles.landingContainer}>
      {/* 랜딩페이지 전용 main */}
      <main className={styles.landingMain}> 
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              뷰티샵과 고객을 잇는<br />
              <span className={styles.heroAccent}>스마트 플랫폼</span>
            </h1>
            <p className={styles.heroDescription}>
              고객은 쉽게 예약하고, 사장님은 편리하게 관리하세요.<br />
              모두가 만족하는 뷰티샵 예약 및 관리 서비스입니다.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/signup" className={`${styles.ctaButton} ${styles.primary}`}>
                지금 시작하기
              </Link>
              <Link href="/shops" className={`${styles.ctaButton} ${styles.secondary}`}>
                샵 찾아보기
              </Link>
              <Link href="/myshop/main" className={`${styles.ctaButton} ${styles.secondary} `}>
                샵 관리하기
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className="hero-illustration">
              <div className={styles.featurePreview}>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>💇🏻‍♀️ 샵 예약</div>
                  <div className={styles.previewNumber}>지도에서 쉽게 찾기</div>
                </div>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>💰 오늘 매출</div>
                  <div className={styles.previewNumber}>245,000 원</div>
                </div>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>✂️ 완료된 시술</div>
                  <div className={styles.previewNumber}>6 건</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 특징 섹션 */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <h2 className={styles.featuresTitle}>고객과 원장님 모두가 만족하는 이유</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>📱</div>
                <h3 className={styles.featureTitle}>24시간 언제든 예약</h3>
                <p className={styles.featureDescription}>
                  고객: 전화할 필요 없이 원하는 시간에 바로 예약<br />
                  사장님: 예약 관리가 자동으로 깔끔하게
                </p>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>⏰</div>
                <h3 className={styles.featureTitle}>실시간 예약 확인</h3>
                <p className={styles.featureDescription}>
                  고객: 예약 상태를 실시간으로 확인 가능<br />
                  사장님: 오늘 스케줄을 한눈에 파악
                </p>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>💰</div>
                <h3 className={styles.featureTitle}>투명한 가격 안내</h3>
                <p className={styles.featureDescription}>
                  고객: 시술별 가격을 미리 확인하고 선택<br />
                  사장님: 매출 관리와 정산이 자동으로
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>지금 바로 시작해보세요</h2>
            <p className={styles.ctaDescription}>
              고객도 사장님도 모두 만족하는 새로운 뷰티샵 경험을 시작하세요
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/signup" className={`${styles.ctaButton} ${styles.large} ${styles.primaryCta}`}>
                시작하기
              </Link>
              {/* <Link href="/login" className={`${styles.ctaButton} ${styles.large} ${styles.secondaryCta}`}>
                예약하러 가기 (고객)
              </Link> */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}