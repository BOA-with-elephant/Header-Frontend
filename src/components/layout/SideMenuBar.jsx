import Link from "next/link"; // ✨ Next.js Link 컴포넌트 - 자동 prefetch, 클라이언트 사이드 라우팅
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✨ Next.js 13+ App Router 훅들

// 메뉴 설정을 별도 객체로 분리하여 관리 용이성 향상
const MENU_CONFIG = {
  admin: [
    {
      key: "reservation",
      title: "예약 관리",
      type: "expandable", // 확장 가능한 메뉴
      firstPath: "/myshop/reservation",
      items: [
        { path: "/myshop/reservation", text: "예약조회/등록" },
        // { path: "/myshop/reservation-list", text: "예약 조회" }
      ]
    },
    {
      key: "sales",
      title: "매출 관리",
      type: "expandable", // 확장 가능한 메뉴
      firstPath: "/myshop/sales",
      items: [
        { path: "/myshop/sales", text: "매출조회/등록" },
        { path: "/myshop/sales/statistics", text: "매출 통계" },
      ]
    },
    {
      key: "customer",
      title: "고객 관리",
      type: "expandable", // 확장 가능한 메뉴
      firstPath: "/myshop/customer",
      items: [
        { path: "/myshop/customer", text: "고객 조회/등록" },
      ]
    },
    {
      key: "menu",
      title: "시술 관리",
      type: "direct", // 바로 이동하는 메뉴
      path: "/myshop/menu"
    },
    {
      key: "message",
      title: "메시지 관리",
      type: "expandable", // 확장 가능한 메뉴
      firstPath: "/myshop/message",
      items: [
        { path: "/myshop/message", text: "새 메세지 작성" },
        { path: "/myshop/message/templateManagement", text: "템플릿 관리" },
        { path: "/myshop/message/auto-setting", text: "자동 발송 설정" },
        { path: "/myshop/message/list", text: "메시지 조회" }
      ]
    }
  ],
  customer: [
    { path: "/shops", text: "샵예약" },
    { path: "/shops/reservation", text: "예약내역" }
  ]
};

// 사용자 프로필 컴포넌트 분리
const UserProfile = ({ userRole, isAdmin, getProfilePath, userInfo }) => {
  // 권한별 프로필 정보 설정
  const getProfileInfo = () => {
    if (userRole === 1) {
      // 권한 1: 일반고객 - 고객이름과 아이디
      return {
        displayName: userInfo?.customerName || "홍길동",
        displayId: userInfo?.customerId || "customer123",
        circleText: userInfo?.customerName?.charAt(0) || "홍",
        isCustomer: true
      };
    } else if (userRole === 2) {
      // 권한 2: 샵관리자 - 회원아이디와 샵이름
      return {
        displayName: userInfo?.shopName || "펌앤코드",
        displayId: userInfo?.userId || "boa",
        circleText: userInfo?.shopName?.charAt(0) || "펌",
        isCustomer: false
      };
    }
    
    // 기본값
    return {
      displayName: "사용자",
      displayId: "user",
      circleText: "사",
      isCustomer: true
    };
  };

  const profileInfo = getProfileInfo();

  return (
    <Link href={getProfilePath()}>
      {/* ✨ Next.js Link - 자동 prefetch와 클라이언트 사이드 라우팅 제공 */}
      <div className="user-profile">
        <div className="profile-container">
          <div className="profile-circle-fallback">
            <span>{profileInfo.circleText}</span>
          </div>
        </div>
        <div className="profile-info">
          <p className="shop-name">{profileInfo.displayName}</p>
          <p className="user-id">@{profileInfo.displayId}</p>
          
          {/* 샵 관리자인 경우에만 뷰모드 표시 */}
          {userRole === 2 && (
            <p className="view-mode-indicator">
              {isAdmin ? "ADMIN" : "CUSTOMER"}
            </p>
          )}
          
          {/* ✨ Next.js 환경 변수 - 개발 모드에서만 권한 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <p className="role-indicator" style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>
              {userRole === 1 ? "일반고객" : "샵관리자"} (권한: {userRole})
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// 확장 가능한 네비게이션 섹션 컴포넌트
const ExpandableNavigationSection = ({ section, expandedSections, toggleSection, currentPath }) => (
  <div className="nav-section">
    <h3
      className="nav-title clickable-title"
      onClick={() => toggleSection(section.key, section.firstPath)}
    >
      {section.title}
      <span className={`arrow ${expandedSections[section.key] ? 'arrow-down' : 'arrow-right'}`}>
        {expandedSections[section.key] ? '〈' : '〉'}
      </span>
    </h3>
    <div className={`nav-list ${expandedSections[section.key] ? 'nav-list-expanded' : 'nav-list-collapsed'}`}>
      {section.items.map(item => (
        <Link key={item.path} href={item.path}>
          {/* ✨ Next.js Link - 페이지 간 빠른 네비게이션 제공 */}
          <div className={`nav-item ${currentPath === item.path ? 'nav-item-active' : ''}`}>
            <span className="nav-text">{item.text}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// 직접 링크 네비게이션 섹션 컴포넌트
const DirectNavigationSection = ({ section, currentPath, closeAllSections }) => (
  <div className="nav-section">
    <Link href={section.path} onClick={closeAllSections}>
      <div className={`nav-item ${currentPath === section.path ? 'nav-item-active' : ''}`} 
           style={{ marginLeft: '0px', padding: '10px' }}>
        <span className="nav-text nav-text-title-size">{section.title}</span>
      </div>
    </Link>
  </div>
);

// 커스텀 훅으로 복잡한 메뉴 로직 분리
const useMenuLogic = (userRole, viewMode, onViewModeChange, closeSideMenu) => {
  const router = useRouter(); // ✨ Next.js useRouter 훅
  const pathname = usePathname(); // ✨ Next.js usePathname 훅 - 현재 경로 자동 감지
  const [expandedSections, setExpandedSections] = useState({});
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // 권한별 뷰모드 제어 로직
  const canSwitchViewMode = userRole === 2; // 샵 관리자만 뷰모드 전환 가능
  const effectiveViewMode = canSwitchViewMode ? viewMode : "customer";
  const isAdmin = effectiveViewMode === "admin" && userRole === 2;
  const isCustomer = effectiveViewMode === "customer";

  // ✨ URL 기반 뷰모드 자동 감지 및 전환
  useEffect(() => {
    if (userRole === 2) { // 샵 관리자만
      if (pathname.startsWith('/myshop') && viewMode !== 'admin') {
        console.log('관리자 페이지 접근 감지: 관리자 모드로 전환');
        onViewModeChange?.('admin');
      } else if (pathname.startsWith('/shops') && viewMode !== 'customer') {
        console.log('고객 페이지 접근 감지: 고객 모드로 전환');
        onViewModeChange?.('customer');
      }
    }
  }, [pathname, userRole, viewMode, onViewModeChange]);

  // 네비게이션 처리 - useEffect로 라우팅 상태 관리
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation); // ✨ Next.js router.push로 프로그래밍 방식 네비게이션
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  // 모든 섹션 닫기 함수 추가
  const closeAllSections = () => {
    setExpandedSections({});
  };
  const toggleSection = (sectionKey, firstPath) => {
    setExpandedSections(prev => {
      const wasExpanded = prev[sectionKey];
      
      // 새로운 상태: 클릭된 섹션만 열고 나머지는 모두 닫기
      const newState = { [sectionKey]: !wasExpanded };
      
      if (!wasExpanded && firstPath) {
        setPendingNavigation(firstPath);
      }
      
      return newState;
    });
  };

  // 뷰 모드 토글 (권한 2만 가능) - 개선된 버전
  const handleViewModeToggle = async () => {
    if (!canSwitchViewMode) {
      console.warn("권한이 없습니다. 샵 관리자만 뷰모드를 전환할 수 있습니다.");
      return;
    }

    const newViewMode = isAdmin ? "customer" : "admin";
    const targetPath = newViewMode === "customer" ? "/shops" : "/myshop/main";
    
    try {
      // 옵션 1: 강제 새로고침으로 확실한 페이지 전환 (필요시 사용)
      // window.location.href = targetPath;
      
      // 옵션 2: router.replace로 히스토리 스택 교체 (뒤로가기 방지)
      // await router.replace(targetPath);
      
      // 옵션 3: 기본 push 방식 (권장)
      await router.push(targetPath);
      
      // 페이지 이동 완료 후 뷰모드 변경
      onViewModeChange?.(newViewMode);
      
      // 사이드메뉴 닫기 (모바일에서 유용)
      if (typeof closeSideMenu === 'function') {
        closeSideMenu();
      }
      
    } catch (error) {
      console.error("페이지 전환 중 오류 발생:", error);
    }
  };

  // 샵 등록 및 관리 페이지로 이동 (권한 1 전용)
  const handleShopManagement = () => {
    router.push("/shop-management"); // ✨ Next.js router.push
  };

  // 프로필 경로 결정 로직
  const getProfilePath = () => {
    if (userRole === 2) { // 샵 관리자
      return isAdmin ? "/myshop/main" : "/shops";
    }
    return "/shops"; // 일반 고객은 항상 고객 페이지
  };

  return {
    pathname, // ✨ usePathname으로 가져온 현재 경로 (기존 currentPath prop 대체)
    expandedSections,
    isAdmin,
    isCustomer,
    canSwitchViewMode,
    toggleSection,
    closeAllSections,
    handleViewModeToggle,
    handleShopManagement,
    getProfilePath
  };
};

// 메인 사이드 메뉴바 컴포넌트
function SideMenuBar({ 
  isOpen, 
  closeSideMenu, 
  userRole, // Layout에서 전달받은 권한 값 (1 또는 2)
  viewMode = "admin",
  onViewModeChange,
  userInfo // 사용자 정보 객체 추가
}) {
  // 커스텀 훅으로 복잡한 로직 처리
  const {
    pathname, // ✨ usePathname으로 가져온 현재 경로
    expandedSections,
    isAdmin,
    isCustomer,
    toggleSection,
    closeAllSections,
    handleViewModeToggle,
    handleShopManagement,
    getProfilePath
  } = useMenuLogic(userRole, viewMode, onViewModeChange, closeSideMenu);

  // 조기 반환으로 불필요한 렌더링 방지
  if (!userRole) return null;

  return (
    <>
      {/* 오버레이 - 사이드메뉴 외부 클릭 시 닫기 */}
      {isOpen && <div className="overlay" onClick={closeSideMenu} />}

      <aside className={`side-menu ${isOpen ? 'side-menu-open' : ''}`}>
        <div className="side-menu-content">
          {/* 사용자 프로필 섹션 */}
          <UserProfile 
            userRole={userRole} 
            isAdmin={isAdmin} 
            getProfilePath={getProfilePath}
            userInfo={userInfo} // 사용자 정보 전달
          />

          {/* 관리자 모드 메뉴 - 권한 2이면서 관리자 모드일 때만 표시 */}
          {isAdmin && userRole === 2 && (
            <nav className="navigation">
              {MENU_CONFIG.admin.map(section => {
                // 메뉴 타입에 따라 다른 컴포넌트 렌더링
                if (section.type === "direct") {
                  return (
                    <DirectNavigationSection
                      key={section.key}
                      section={section}
                      currentPath={pathname}
                      closeAllSections={closeAllSections}
                    />
                  );
                } else {
                  return (
                    <ExpandableNavigationSection
                      key={section.key}
                      section={section}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      currentPath={pathname}
                    />
                  );
                }
              })}
            </nav>
          )}

          {/* 고객 모드 메뉴 - 고객 모드이거나 권한 1일 때 표시 */}
          {(isCustomer || userRole === 1) && (
            <nav className="navigation">
              {MENU_CONFIG.customer.map(menu => (
                <Link key={menu.path} href={menu.path}>
                  {/* ✨ Next.js Link - 자동 prefetch와 최적화된 네비게이션 */}
                  <div className={`nav-item ${pathname === menu.path ? 'nav-item-active' : ''}`}>
                    <span className="nav-text nav-text-title-size">{menu.text}</span>
                  </div>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* 하단 고정 메뉴 */}
        <div className="bottom-menu">
          {/* 설정 메뉴 */}
          <Link href={isAdmin ? "/myshop/settings" : "/user/settings"}>
            {/* ✨ Next.js Link - 설정 페이지로 최적화된 네비게이션 */}
            <div className={`bottom-menu-item ${
              pathname === (isAdmin ? "/myshop/settings" : "/user/settings") 
                ? 'bottom-menu-item-active' : ''
            }`}>
              <span className="bottom-menu-icon">⚙️</span>
              <span className="bottom-menu-text">설정</span>
            </div>
          </Link>
          
          {/* 권한별 하단 메뉴 */}
          {userRole === 1 ? (
            // 권한 1: 샵 등록 및 관리 (프로그래밍 방식 네비게이션)
            <div className="bottom-menu-item clickable" onClick={handleShopManagement}>
              <span className="bottom-menu-icon">🏪</span>
              <span className="bottom-menu-text">샵 등록 및 관리</span>
            </div>
          ) : userRole === 2 ? (
            // 권한 2: 뷰 모드 전환 (프로그래밍 방식 네비게이션)
            <div className="bottom-menu-item clickable" onClick={handleViewModeToggle}>
              <span className="bottom-menu-icon">{isAdmin ? "👤" : "🔧"}</span>
              <span className="bottom-menu-text">
                {isAdmin? "고객 페이지 전환" : "관리자 페이지 전환"}
              </span>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export default SideMenuBar;