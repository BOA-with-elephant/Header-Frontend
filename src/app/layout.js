'use client'
import Layout from "@/components/layout/Layout";
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import "@/styles/common/globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // 랜딩페이지 경로들 (사이드메뉴 없는 페이지들)
    const landingPaths = ['/', '/auth/session', '/auth/signup', "/auth/verification-code", "/auth/verification-code/validate", '/auth/terms-of-use'];
  const isLandingPage = landingPaths.includes(pathname);

  return (
    <html lang="ko">
      <body>
        {isLandingPage ? (
          // 랜딩페이지: 헤더/푸터만 (사이드메뉴 없음)
          <div className="landing-layout"> {/* ✨ globals.css 클래스 사용 */}
            <Header isLandingPage={true} /> {/* ✨ 랜딩페이지 플래그 전달 */}
            <main className="landing-main"> {/* ✨ globals.css 클래스 사용 */}
              {children}
            </main>
            <Footer isLandingPage={true} /> {/* ✨ 랜딩페이지 플래그 전달 */}
          </div>
        ) : (
          // CRM 페이지: 기존 레이아웃 (헤더/사이드메뉴/푸터)
          <Layout>
            <main className="main-content"> {/* ✨ globals.css 클래스 사용 */}
              <div className="content-wrapper"> {/* ✨ globals.css 클래스 사용 */}
                {children}
              </div>
            </main>
          </Layout>
        )}
      </body>
    </html>
  );
}