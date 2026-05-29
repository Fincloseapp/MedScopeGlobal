export function SubscribePage() {
  return (
    <main className="page-shell">
      <section className="subscription-page">
        <p className="eyebrow">Subscribe</p>
        <h1>Professional medical intelligence briefing</h1>
        <p>
          Subscribe to receive weekly clinical insights, research updates, policy alerts, pharma intelligence,
          congress reports and early-career opportunities.
        </p>
        <form className="subscribe-form">
          <label>
            Work email
            <input type="email" placeholder="name@institution.org" required />
          </label>
          <label>
            Specialty
            <select defaultValue="">
              <option value="" disabled>
                Select specialty
              </option>
              <option>Internal Medicine</option>
              <option>Cardiology</option>
              <option>Oncology</option>
              <option>Digital Health</option>
              <option>Healthcare Economics</option>
              <option>Clinical Pharmacology</option>
            </select>
          </label>
          <button className="button button--primary" type="submit">
            Subscribe
          </button>
        </form>
      </section>
    </main>
  );
}
