import { FormEvent, useMemo, useState } from 'react';
import { trackEvent, type AnalyticsEventName } from '../utils/analytics';

type LeadFormKind = 'newsletter' | 'enterprise' | 'event' | 'job' | 'partnership';

interface LeadFormProps {
  kind: LeadFormKind;
  title: string;
  description: string;
  submitLabel: string;
  context?: string;
  analyticsEvent?: AnalyticsEventName;
  compact?: boolean;
}

const endpoint = import.meta.env.VITE_LEAD_CAPTURE_ENDPOINT as string | undefined;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LeadForm({ kind, title, description, submitLabel, context, analyticsEvent = 'form_submit', compact = false }: LeadFormProps) {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string }>();
  const storageKey = useMemo(() => `medscope.leads.${kind}.v1`, [kind]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();

    if (!name) {
      setStatus({ type: 'error', message: 'Please enter your name.' });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid work email address.' });
      return;
    }

    const payload = {
      kind,
      context,
      name,
      email,
      organization: String(formData.get('organization') ?? '').trim(),
      role: String(formData.get('role') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      submittedAt: new Date().toISOString(),
    };

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Lead endpoint returned ${response.status}`);
        trackEvent(analyticsEvent, { kind, context });
        setStatus({ type: 'success', message: 'Thank you. Your request was sent to the configured intake workflow.' });
        form.reset();
        return;
      } catch (error) {
        setStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'The configured lead endpoint did not accept the request.',
        });
        return;
      }
    }

    const existing = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown[];
    window.localStorage.setItem(storageKey, JSON.stringify([...existing, payload]));
    trackEvent('form_submit_local_fallback', { kind, context });
    setStatus({
      type: 'info',
      message:
        'No CRM endpoint is configured in this environment. The validated request was saved locally for implementation testing.',
    });
    form.reset();
  }

  return (
    <section className={`lead-form ${compact ? 'lead-form--compact' : ''}`}>
      <div>
        <p className="eyebrow">{kind === 'enterprise' ? 'Institutional inquiry' : 'Lead capture'}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        {!endpoint ? (
          <p className="form-notice" role="note">
            CRM/email delivery is not configured. Set VITE_LEAD_CAPTURE_ENDPOINT to enable production submissions.
          </p>
        ) : null}
      </div>
      <form onSubmit={onSubmit} noValidate>
        <label>
          Name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Work email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Organization
          <input name="organization" autoComplete="organization" />
        </label>
        <label>
          Role / specialty
          <input name="role" />
        </label>
        <label className="full-row">
          Message
          <textarea name="message" rows={compact ? 3 : 5} />
        </label>
        <button className="button button--primary" type="submit">
          {submitLabel}
        </button>
        {status ? (
          <output className={`form-status form-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
            {status.message}
          </output>
        ) : null}
      </form>
    </section>
  );
}
