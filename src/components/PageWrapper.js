'use client';
import { usePathname } from 'next/navigation';
import Layout from './Layout';
import Header from './Header';
import Footer from './Footer';

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  const landingPaths = ['/', '/auth/session', '/auth/users', '/auth/verification-code', '/auth/verification-code/validate', '/auth/terms-of-use'];
  const isLandingPage = landingPaths.includes(pathname);

  return isLandingPage ? (
    <div className="landing-layout">
      <Header isLandingPage={true} />
      <main className="landing-main">{children}</main>
      <Footer isLandingPage={true} />
    </div>
  ) : (
    <Layout>
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </Layout>
  );
}
