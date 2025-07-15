import Link from "next/link"; // ✨ Next.js Link 컴포넌트

// 푸터 링크 설정을 별도 객체로 분리하여 관리 용이성 향상
const FOOTER_LINKS = [
  { href: "/terms", text: "이용약관", internal: true },
  { href: "/privacy", text: "개인정보처리방침", internal: true },
  { href: "https://www.kfme.or.kr/kr/index.php", text: "소상공인연합회", internal: false }
];

// 회사 정보를 별도 객체로 분리
const COMPANY_INFO = {
  address: "서울특별시 송파구 중대로9길 34(가락동) 대호빌딩 3층",
  ceo: "HEADER",
  businessNumber: "215-82-12405",
  phone: "02-430-6070",
  fax: "02-430-6071",
  privacyManager: "HEADER",
  copyright: "송파여성인력개발센터 TEAM HEADER"
};

// 링크 렌더링 컴포넌트 분리
const FooterLink = ({ link, isLast }) => {
  const LinkComponent = link.internal ? (
    <Link href={link.href} className="footer-link"> {/* ✨ globals.css 클래스 사용 */}
      {/* ✨ Next.js Link - 내부 링크는 자동 prefetch와 클라이언트 사이드 라우팅 */}
      {link.text}
    </Link>
  ) : (
    <a 
      href={link.href} 
      className="footer-link" // ✨ globals.css 클래스 사용
      target="_blank" 
      rel="noopener noreferrer" // ✨ 보안 강화
    >
      {link.text}
    </a>
  );

  return (
    <>
      {LinkComponent}
      {!isLast && <span className="separator">|</span>} {/* ✨ globals.css 클래스 사용 */}
    </>
  );
};

// 회사 정보 컴포넌트 분리
const CompanyInfo = () => (
  <div className="footer-info"> {/* ✨ globals.css 클래스 사용 */}
    <p>{COMPANY_INFO.address}</p>
    <p>
      대표 : {COMPANY_INFO.ceo} | 사업자등록번호 : {COMPANY_INFO.businessNumber}
    </p>
    <p>
      전화 : {COMPANY_INFO.phone} | 팩스 : {COMPANY_INFO.fax} | 
      개인정보관리책임자 : {COMPANY_INFO.privacyManager}
    </p>
  </div>
);

// 저작권 정보 컴포넌트 분리
const Copyright = () => {
  const currentYear = new Date().getFullYear(); // ✨ 동적 연도 계산

  return (
    <div className="footer-copy"> {/* ✨ globals.css 클래스 사용 */}
      Copyright© {currentYear}. {COMPANY_INFO.copyright}. All rights Reserved.
    </div>
  );
};

// 메인 Footer 컴포넌트
function Footer({ isLandingPage = false }) { // ✨ 랜딩페이지 여부 prop 추가
  return (
    <footer className={`footer ${isLandingPage ? 'footer-landing' : ''}`}> {/* ✨ globals.css 클래스 사용 */}
      <div className="footer-inner"> {/* ✨ globals.css 클래스 사용 */}
        {/* 약관 링크 섹션 */}
        <div className="footer-links"> {/* ✨ globals.css 클래스 사용 */}
          {FOOTER_LINKS.map((link, index) => (
            <FooterLink 
              key={link.href} 
              link={link} 
              isLast={index === FOOTER_LINKS.length - 1}
            />
          ))}
        </div>

        {/* 회사 정보 섹션 */}
        <CompanyInfo />

        {/* 저작권 섹션 */}
        <Copyright />
      </div>
    </footer>
  );
}

export default Footer;