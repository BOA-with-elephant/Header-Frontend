import Link from 'next/link'; // Next.js Link 컴포넌트
import Image from 'next/image'; // Next.js Image 컴포넌트 - 자동 최적화
import { useRouter } from 'next/navigation'; // Next.js useRouter 훅
import React, { useState, useEffect } from 'react'; // useState, useEffect 임포트 추가

// 헤더 액션 버튼 설정을 별도 객체로 분리
const HEADER_ACTIONS = {
  authenticated: [
    { href: "/profile", text: "프로필", type: "link" },
    { text: "로그아웃", type: "action" } // href 제거, type: "action"으로 변경
  ],
  unauthenticated: [
    { href: "/auth/session", text: "로그인", type: "link" },
    { href: "/auth/users", text: "회원가입", type: "link" }
  ]
};

// 햄버거 메뉴 버튼 컴포넌트 분리
const HamburgerButton = ({ isSideMenuOpen, toggleSideMenu }) => (
  <button
    onClick={toggleSideMenu}
    className="hamburger-menu"
    aria-label={`메뉴 ${isSideMenuOpen ? '닫기' : '열기'}`}
    aria-expanded={isSideMenuOpen}
  >
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-1-active' : ''}`}></span>
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-2-active' : ''}`}></span>
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-3-active' : ''}`}></span>
  </button>
);

// 로고 컴포넌트 분리
const Logo = () => ( // isLandingPage prop 제거 (Logo 컴포넌트 자체에는 직접적인 영향이 없음)
  <Link href="/" aria-label="홈으로 이동">
    <Image 
      src="/images/headerLogo.png" 
      alt="로고" 
      width={120}
      height={40}
      className="logo"
      priority
    />
  </Link>
);

// 액션 버튼 컴포넌트 분리
// onLogout 함수를 prop으로 받아서 처리하도록 변경
const ActionButton = ({ action, onLogout }) => {
  const router = useRouter();

  const handleClick = () => { // async 키워드 제거 (onLogout이 비동기라면 Header에서 처리)
    if (action.type === 'action' && action.text === '로그아웃') {
      onLogout(); // onLogout 함수 호출
    } else if (action.type === 'link') {
      router.push(action.href);
    }
  };

  return action.type === 'link' ? (
    <Link href={action.href}>
      <button className="logout-btn" aria-label={action.text}>
        {action.text}
      </button>
    </Link>
  ) : (
    <button 
      className="logout-btn"
      onClick={handleClick}
      aria-label={action.text}
    >
      {action.text}
    </button>
  );
};

// 네비게이션 액션 섹션 컴포넌트 분리
// 이제 isAuthenticated와 onLogout을 prop으로 받습니다.
const NavigationActions = ({ isAuthenticated, onLogout }) => {
  const actions = isAuthenticated ? HEADER_ACTIONS.authenticated : HEADER_ACTIONS.unauthenticated;

  return (
    <div className="nav-actions">
      {actions.map((action, index) => (
        <ActionButton 
          key={`${action.href || action.text}-${index}`} // href가 없는 경우 text로 대체
          action={action} 
          onLogout={onLogout} // onLogout 함수 전달
        />
      ))}
    </div>
  );
};

// 메인 헤더 컴포넌트
function Header({ 
  isSideMenuOpen, 
  toggleSideMenu, 
  isLandingPage = false // 랜딩페이지 여부 prop 추가
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter(); // 로그아웃 후 리다이렉션을 위해 useRouter 사용

  // 로그인 상태 확인 및 초기화 로직
  useEffect(() => {
    // localStorage에서 토큰 존재 여부로 로그인 상태 판단
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // 토큰이 있으면 true, 없으면 false
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('token'); // localStorage에서 토큰 삭제
    setIsAuthenticated(false); // 인증 상태 업데이트
    router.push('/'); // 홈 페이지 또는 로그인 페이지로 리다이렉트
    // 필요한 경우 추가적인 로그아웃 관련 백엔드 API 호출 (예: 토큰 무효화)
    // 예: fetch('http://localhost:8080/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }});
  };

  return (
    <header className={`header ${isLandingPage ? 'header-landing' : ''}`}>
      {/* 모바일 햄버거 메뉴 버튼 - 랜딩페이지에서는 숨김 */}
      {!isLandingPage && (
        <HamburgerButton 
          isSideMenuOpen={isSideMenuOpen} 
          toggleSideMenu={toggleSideMenu} 
        />
      )}

      {/* 로고 영역 */}
      <div className="logo-container"> {/* isLandingPage prop 제거, 필요하면 Logo 컴포넌트 내부에서 처리 */}
        <Logo />
      </div>

      {/* 헤더 액션 버튼들 */}
      <NavigationActions 
        isAuthenticated={isAuthenticated} // 로그인 상태 전달
        onLogout={handleLogout} // 로그아웃 핸들러 전달
      />
    </header>
  );
}

export default Header;