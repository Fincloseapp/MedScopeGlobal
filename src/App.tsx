import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { pageDefinitions } from './data/pages';
import { useScheduledContentRefresh } from './hooks/useContent';
import { CareersPage } from './pages/CareersPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResearchSubmissionPage } from './pages/ResearchSubmissionPage';
import { SectionPage } from './pages/SectionPage';
import { SubscribePage } from './pages/SubscribePage';
import { detectBrowserLocale, getLocaleFromPath, persistLocale, stripLocaleFromPath, withLocale } from './utils/locale';

export function App() {
  const location = useLocation();
  const urlLocale = getLocaleFromPath(location.pathname);
  const locale = urlLocale ?? detectBrowserLocale();
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);

  useScheduledContentRefresh();

  useEffect(() => {
    if (urlLocale) persistLocale(urlLocale);
  }, [urlLocale]);

  if (!urlLocale) {
    return <Navigate to={withLocale(locale, pathWithoutLocale) + location.search} replace />;
  }

  return (
    <div>
      <Header locale={locale} />
      <Routes>
        <Route path="/:locale" element={<HomePage locale={locale} />} />
        <Route path="/:locale/" element={<HomePage locale={locale} />} />
        {pageDefinitions.map((page) => (
          <Route
            path={`/:locale${page.path}`}
            element={<SectionPage page={page} locale={locale} />}
            key={page.path}
          />
        ))}
        <Route path="/:locale/careers" element={<CareersPage locale={locale} />} />
        <Route path="/:locale/subscribe" element={<SubscribePage />} />
        <Route path="/:locale/research/submit" element={<ResearchSubmissionPage />} />
        <Route path="*" element={<NotFoundPage locale={locale} />} />
      </Routes>
      <footer className="site-footer">
        <strong>MedScopeGlobal</strong>
        <span>Professional medical portal for clinical, research, policy, pharma and career intelligence.</span>
      </footer>
    </div>
  );
}
