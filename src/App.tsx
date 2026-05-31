import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { pageDefinitions } from './data/pages';
import { commercialPages } from './data/platform';
import { useScheduledContentRefresh } from './hooks/useContent';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { CareersPage } from './pages/CareersPage';
import { CommercialPage } from './pages/CommercialPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventsEducationPage } from './pages/EventsEducationPage';
import { HomePage } from './pages/HomePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobsPage } from './pages/JobsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResearchSubmissionPage } from './pages/ResearchSubmissionPage';
import { SectionPage } from './pages/SectionPage';
import { SubscribePage } from './pages/SubscribePage';
import { StaticPage } from './pages/StaticPage';
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
    <ErrorBoundary>
      <div>
        <Header locale={locale} />
        <Routes>
          <Route path="/:locale" element={<HomePage locale={locale} />} />
          <Route path="/:locale/" element={<HomePage locale={locale} />} />
          <Route path="/:locale/articles" element={<ArticlesPage locale={locale} />} />
          <Route path="/:locale/articles/:articleSlug" element={<ArticleDetailPage locale={locale} />} />
          <Route path="/:locale/events" element={<EventsEducationPage locale={locale} />} />
          <Route path="/:locale/events/:eventSlug" element={<EventDetailPage locale={locale} />} />
          <Route path="/:locale/jobs" element={<JobsPage locale={locale} />} />
          <Route path="/:locale/jobs/:jobSlug" element={<JobDetailPage locale={locale} />} />
          <Route path="/:locale/authors" element={<AuthorsPage locale={locale} />} />
          <Route path="/:locale/knowledge" element={<StaticPage locale={locale} kind="knowledge" />} />
          <Route path="/:locale/specialties" element={<StaticPage locale={locale} kind="specialties" />} />
          <Route path="/:locale/reports" element={<StaticPage locale={locale} kind="reports" />} />
          <Route path="/:locale/about" element={<StaticPage locale={locale} kind="about" />} />
          <Route path="/:locale/editorial" element={<StaticPage locale={locale} kind="editorial" />} />
          <Route path="/:locale/contact" element={<StaticPage locale={locale} kind="contact" />} />
          {commercialPages.map((page) => (
            <Route
              key={page.path}
              path={`/:locale${page.path}`}
              element={<CommercialPage page={page} locale={locale} />}
            />
          ))}
          {pageDefinitions.map((page) => (
            <Route
              path={`/:locale${page.path}`}
              element={<SectionPage page={page} locale={locale} />}
              key={page.path}
            />
          ))}
          <Route path="/:locale/careers" element={<CareersPage locale={locale} />} />
          <Route path="/:locale/subscribe" element={<SubscribePage locale={locale} />} />
          <Route path="/:locale/research/submit" element={<ResearchSubmissionPage locale={locale} />} />
          <Route path="*" element={<NotFoundPage locale={locale} />} />
        </Routes>
        <Footer locale={locale} />
      </div>
    </ErrorBoundary>
  );
}
