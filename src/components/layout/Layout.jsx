"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import SideMenuBar from "./SideMenuBar";

// 사용자 권한 상수
const USER_ROLES = {
  CUSTOMER: 1,
  SHOP_ADMIN: 2
};

// ===== 테스트용 설정 (이 값만 변경해서 테스트) =====
const TEST_MODE = true;
const TEST_USER_ROLE = USER_ROLES.SHOP_ADMIN; // .CUSTOMER or .SHOP_ADMIN 로 변경해서 테스트
// ==============================================

export default function Layout({ children }) {
  const pathname = usePathname();

  // 사이드 메뉴 열림/닫힘 상태 관리
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // 뷰 모드 상태 관리
  const [viewMode, setViewMode] = useState('admin');
  
  // 사용자 권한 상태 관리
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (TEST_MODE) {
        // 테스트 모드: 임시 권한 설정
        console.log('🔧 테스트 모드: 권한', TEST_USER_ROLE);
        setUserRole(TEST_USER_ROLE);
        setIsLoading(false);
        return;
      }

      try {
        // 실제 구현 시: API 호출로 사용자 정보 가져오기
        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        } else {
          console.error('사용자 정보를 가져올 수 없습니다.');
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // 첫 로드시에만 localStorage 체크
  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'customer') {
      setViewMode('customer');
    }
  }, []);

  // 라우트 변경 시 메뉴 자동 닫기
  useEffect(() => {
    setIsSideMenuOpen(false);
  }, [pathname]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSideMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 사이드 메뉴 토글 함수
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  // 사이드 메뉴 닫기 함수
  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('viewMode', newViewMode);
    setIsSideMenuOpen(false);
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 권한 정보가 없을 때 (로그인 필요)
  if (userRole === null) {
    return (
      <div className="auth-required">
        <div>로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 헤더 */}
      <Header
        isSideMenuOpen={isSideMenuOpen}
        toggleSideMenu={toggleSideMenu}
        userRole={userRole}
      />

      {/* 오버레이 */}
      {isSideMenuOpen && (
        <div
          className="overlay"
          onClick={closeSideMenu}
          style={{ display: 'block' }}
        />
      )}

      {/* 사이드 메뉴바 */}
      <SideMenuBar
        isOpen={isSideMenuOpen}
        closeSideMenu={closeSideMenu}
        currentPath={pathname}
        userRole={userRole} // Layout에서 관리하는 권한 전달
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* 메인 콘텐츠 */}
      {children}

      {/* 푸터 */}
      <Footer />
    </div>
  );
}