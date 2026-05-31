import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('MedScopeGlobal render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page-shell">
          <section className="page-hero">
            <div>
              <p className="eyebrow">Service notice</p>
              <h1>We could not render this page safely.</h1>
              <p>
                The application recovered from a rendering issue. Please return home or reload the page. No medical
                or personal data has been submitted from this error state.
              </p>
              <a className="button button--primary" href="/en/">
                Return home
              </a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
