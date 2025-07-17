import Link from 'next/link'; // ✨ Next.js Link 컴포넌트
import Image from 'next/image'; // ✨ Next.js Image 컴포넌트 - 자동 최적화
import { useRouter } from 'next/navigation'; // ✨ Next.js useRouter 훅
import React from 'react';

// 헤더 액션 버튼 설정을 별도 객체로 분리
const HEADER_ACTIONS = {
  authenticated: [
    { href: "/profile", text: "프로필", type: "link" },
    { href: "/logout", text: "로그아웃", type: "action" }
  ],
  unauthenticated: [
    { href: "/auth/session", text: "로그인", type: "link" },
    { href: "/auth/signup", text: "회원가입", type: "link" }
  ]
};

// 햄버거 메뉴 버튼 컴포넌트 분리
const HamburgerButton = ({ isSideMenuOpen, toggleSideMenu }) => (
  <button
    onClick={toggleSideMenu}
    className="hamburger-menu" // ✨ globals.css 클래스 사용
    aria-label={`메뉴 ${isSideMenuOpen ? '닫기' : '열기'}`}
    aria-expanded={isSideMenuOpen}
  >
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-1-active' : ''}`}></span>
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-2-active' : ''}`}></span>
    <span className={`hamburger-line ${isSideMenuOpen ? 'line-3-active' : ''}`}></span>
  </button>
);

// 로고 컴포넌트 분리
const Logo = ({ isLandingPage }) => (
  <Link href="/" aria-label="홈으로 이동">
    <Image 
      src="/images/headerLogo.png" 
      alt="로고" 
      width={120}
      height={40}
      className="logo" // ✨ globals.css 클래스 사용
      priority
    />
  </Link>
);

// 액션 버튼 컴포넌트 분리
const ActionButton = ({ action, onLogout }) => {
  const router = useRouter();

  const handleClick = () => {
    if (action.type === 'action' && action.text === '로그아웃') {
      onLogout?.();
    } else if (action.type === 'link') {
      router.push(action.href);
    }
  };

  return action.type === 'link' ? (
    <Link href={action.href}>
      <button className="logout-btn" aria-label={action.text}> {/* ✨ globals.css 클래스 사용 */}
        {action.text}
      </button>
    </Link>
  ) : (
    <button 
      className="logout-btn" // ✨ globals.css 클래스 사용
      onClick={handleClick}
      aria-label={action.text}
    >
      {action.text}
    </button>
  );
};

// 네비게이션 액션 섹션 컴포넌트 분리
const NavigationActions = ({ isAuthenticated = false, onLogout }) => {
  const actions = isAuthenticated ? HEADER_ACTIONS.authenticated : HEADER_ACTIONS.unauthenticated;

  return (
    <div className="nav-actions"> {/* ✨ globals.css 클래스 사용 */}
      {actions.map((action, index) => (
        <ActionButton 
          key={`${action.href}-${index}`} 
          action={action} 
          onLogout={onLogout}
        />
      ))}
    </div>
  );
};

// 메인 헤더 컴포넌트
function Header({ 
  isSideMenuOpen, 
  toggleSideMenu, 
  isAuthenticated = false,
  onLogout,
  isLandingPage = false // ✨ 랜딩페이지 여부 prop 추가
}) {
  return (
    <header className={`header ${isLandingPage ? 'header-landing' : ''}`}> {/* ✨ globals.css 클래스 사용 */}
      {/* 모바일 햄버거 메뉴 버튼 - 랜딩페이지에서는 숨김 */}
      {!isLandingPage && (
        <HamburgerButton 
          isSideMenuOpen={isSideMenuOpen} 
          toggleSideMenu={toggleSideMenu} 
        />
      )}

      {/* 로고 영역 */}
      <div className={`logo-container ${isLandingPage ? 'logo-container-landing' : ''}`}> {/* ✨ globals.css 클래스 사용 */}
        <Logo isLandingPage={isLandingPage} />
      </div>

      {/* 헤더 액션 버튼들 */}
      <NavigationActions 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout}
      />
    </header>
  );
}

export default Header;