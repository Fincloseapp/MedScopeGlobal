import { FormEvent, useState } from 'react';
import { submitResearch } from '../content/aiContentEngine';

export function ResearchSubmissionPage() {
  const [status, setStatus] = useState<string>();

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = submitResearch({
      title: String(form.get('title') ?? ''),
      abstract: String(form.get('abstract') ?? ''),
      authors: String(form.get('authors') ?? ''),
      affiliation: String(form.get('affiliation') ?? ''),
      specialty: String(form.get('specialty') ?? ''),
      contactEmail: String(form.get('contactEmail') ?? ''),
    });
    setStatus(`Submission ${result.id} received at ${new Date(result.submittedAt).toLocaleString()}.`);
    event.currentTarget.reset();
  }

  return (
    <main className="page-shell">
      <section className="subscription-page">
        <p className="eyebrow">Research submission system</p>
        <h1>Submit research to MedScopeGlobal</h1>
        <p>
          Submit structured abstracts, student research or early-career studies for editorial screening and routing
          into the research hub.
        </p>
        <form className="subscribe-form subscribe-form--wide" onSubmit={onSubmit}>
          <label>
            Research title
            <input name="title" required />
          </label>
          <label>
            Authors
            <input name="authors" required placeholder="Name, title; Name, title" />
          </label>
          <label>
            Affiliation
            <input name="affiliation" required />
          </label>
          <label>
            Specialty
            <input name="specialty" required />
          </label>
          <label>
            Contact email
            <input name="contactEmail" type="email" required />
          </label>
          <label className="full-row">
            Abstract
            <textarea name="abstract" rows={8} required />
          </label>
          <button className="button button--primary" type="submit">
            Submit research
          </button>
          {status ? <output>{status}</output> : null}
        </form>
      </section>
    </main>
  );
}
