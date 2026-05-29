import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { navigation } from '../data/navigation';
import type { Locale } from '../types/content';
import { persistLocale, stripLocaleFromPath, supportedLocales, withLocale } from '../utils/locale';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | undefined>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = stripLocaleFromPath(location.pathname);

  useEffect(() => {
    setOpenDropdown(undefined);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenDropdown(undefined);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  function isMainActive(path?: string, section?: string): boolean {
    if (path === '/') return currentPath === '/';
    if (path) return currentPath === path;
    return Boolean(section && currentPath.startsWith(section));
  }

  function changeLocale(nextLocale: Locale): void {
    persistLocale(nextLocale);
    navigate(withLocale(nextLocale, currentPath));
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="topline">
        <Link to={withLocale(locale, '/')} className="brand" aria-label="MedScopeGlobal home">
          <span className="brand__mark">MSG</span>
          <span>
            <strong>MedScopeGlobal</strong>
            <small>Clinical intelligence portal</small>
          </span>
        </Link>
        <div className="header-actions">
          <label className="locale-switcher">
            <span>Language</span>
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              {supportedLocales.map((value) => (
                <option key={value} value={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <button
            className="mobile-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav className={`main-nav ${mobileOpen ? 'main-nav--open' : ''}`} aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = isMainActive(item.path, item.section);
          if (!item.children) {
            return (
              <NavLink
                key={item.label}
                to={withLocale(locale, item.path ?? '/')}
                className={({ isActive }) => `nav-link ${isActive || active ? 'nav-link--active' : ''}`}
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            );
          }

          const open = openDropdown === item.label;
          return (
            <div className="nav-dropdown" key={item.label}>
              <button
                type="button"
                className={`nav-link nav-link--button ${active ? 'nav-link--active' : ''}`}
                aria-expanded={open}
                aria-controls={`dropdown-${item.label.replace(/\W+/g, '-').toLowerCase()}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenDropdown((value) => (value === item.label ? undefined : item.label));
                }}
              >
                {item.label} <span aria-hidden="true">▼</span>
              </button>
              <div
                className={`dropdown-menu ${open ? 'dropdown-menu--open' : ''}`}
                id={`dropdown-${item.label.replace(/\W+/g, '-').toLowerCase()}`}
              >
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={withLocale(locale, child.path)}
                    className={({ isActive }) => `dropdown-link ${isActive ? 'dropdown-link--active' : ''}`}
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
