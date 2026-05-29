import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { navChildren, navigation } from './data/navigation';
import { mockEmptyFetch } from './test/mockFetch';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current-path">{location.pathname}</output>;
}

function renderApp(path = '/en/') {
  mockEmptyFetch();
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('MedScopeGlobal routing and navigation', () => {
  it('opens dropdowns on click and navigates to each submenu URL with active states', async () => {
    const user = userEvent.setup();
    renderApp('/en/');

    for (const item of navigation.filter((entry) => entry.children)) {
      await user.click(screen.getByRole('button', { name: new RegExp(item.label) }));
      for (const child of item.children ?? []) {
        const link = screen.getByRole('link', { name: child.label });
        expect(link).toHaveAttribute('href', `/en${child.path}`);
      }
    }

    await user.click(screen.getByRole('button', { name: /PROFESSIONAL/ }));
    await user.click(screen.getByRole('link', { name: 'Clinical Insights' }));

    expect(screen.getByLabelText('current-path')).toHaveTextContent('/en/professional/clinical-insights');
    expect(await screen.findByRole('heading', { name: 'Clinical Insights' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PROFESSIONAL/ })).toHaveClass('nav-link--active');
      expect(screen.getByRole('link', { name: 'Clinical Insights', hidden: true })).toHaveClass('dropdown-link--active');
  });

  it('has working top-level home, careers and subscribe routes', async () => {
    const user = userEvent.setup();
    renderApp('/en/professional/clinical-insights');

    await user.click(screen.getByRole('link', { name: /CAREERS/ }));
    expect(screen.getByLabelText('current-path')).toHaveTextContent('/en/careers');
    expect(await screen.findByRole('heading', { level: 1, name: /Medical careers/ })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /SUBSCRIBE/ }));
    expect(screen.getByLabelText('current-path')).toHaveTextContent('/en/subscribe');
    expect(await screen.findByRole('heading', { name: /Professional medical intelligence briefing/ })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /MedScopeGlobal home/ }));
    expect(screen.getByLabelText('current-path')).toHaveTextContent('/en/');
    expect(await screen.findByRole('heading', { name: /Clinical intelligence/ })).toBeInTheDocument();
  });

  it('exposes every required submenu route as a localized URL', () => {
    renderApp('/en/');
    for (const child of navChildren) {
      expect(screen.getByRole('link', { name: child.label, hidden: true })).toHaveAttribute('href', `/en${child.path}`);
    }
  });

  it('auto-detects locale for unprefixed URLs and stores explicit language changes', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['de-DE', 'en-US'],
    });
    renderApp('/research/articles');

    expect(screen.getByLabelText('current-path')).toHaveTextContent('/de/research/articles');
    const selector = screen.getByLabelText(/Language/);
    await user.selectOptions(selector, 'pl');
    expect(localStorage.getItem('language')).toBe('pl');
    expect(screen.getByLabelText('current-path')).toHaveTextContent('/pl/research/articles');
  });

  it('mobile menu toggle exposes navigation controls', async () => {
    const user = userEvent.setup();
    renderApp('/en/');
    const toggle = screen.getByRole('button', { name: /Toggle menu/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('navigation')).getByText('HOME')).toBeInTheDocument();
  });
});
