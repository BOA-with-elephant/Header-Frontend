"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import SideMenuBar from "./SideMenuBar";

// 사용자 권한 상수
const USER_ROLES = {
  CUSTOMER: "ROLE_USER",
  SHOP_ADMIN: "ROLE_ADMIN"
};

export default function Layout({ children }) {
  const pathname = usePathname();

  // 사이드 메뉴 열림/닫힘 상태 관리
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // 뷰 모드 상태 관리
  const [viewMode, setViewMode] = useState('admin');
  
  // 사용자 권한 상태 관리
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // 사용자 정보 로드
  useEffect(() => {
    // 여기에 loadUserInfo 함수 정의가 정확히 들어가야 합니다.
    const loadUserInfo = async () => { // <-- 여기에 async 키워드가 있어야 합니다.
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('토큰이 없어 로그인이 안 된 사용자입니다.');
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // 백엔드 사용자 정보 조회 API 엔드포인트
        const response = await fetch('http://localhost:8080/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const responseData = await response.json();
          const userData = responseData.data;

          console.log('Layout: 사용자 정보 로드 성공:', userData);
          setUserInfo(userData);
          setUserRole(userData.admin ? 2 : 1);
        } else if (response.status === 401 || response.status === 403) {
          console.error('Layout: 사용자 정보를 가져올 수 없습니다. 토큰 만료 또는 권한 없음.', response.status);
          localStorage.removeItem('token');
          setUserRole(null);
        } else {
          console.error('Layout: 사용자 정보 로드 실패 (알 수 없는 오류):', response.status);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Layout: 사용자 정보 로드 중 네트워크 오류 발생:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo(); // 정의된 비동기 함수를 호출합니다.
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
        userInfo={userInfo}
      />

      {/* 메인 콘텐츠 */}
      {children}

      {/* 푸터 */}
      <Footer />
    </div>
  );
}