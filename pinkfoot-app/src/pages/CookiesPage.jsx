import SectionHeader from "../components/SectionHeader.jsx";

export default function CookiesPage() {
  return (
    <main className="pt-[72px]">
      <section className="bg-[var(--color-pink-pale)] py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Legal"
            title="Cookie Policy"
            subtitle="How we use cookies to improve your holiday planning experience."
          />
        </div>
      </section>
      <section className="container-page py-20">
        <div className="prose mx-auto max-w-3xl text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg font-semibold text-[var(--color-navy)]">Last Updated: June 18, 2026</p>
          <p>
            This Cookie Policy explains how Pinkfoot Travel uses cookies and similar tracking technologies on our website.
          </p>
          
          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">1. What are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites that you visit. They are widely used to make websites work more efficiently, improve performance, and provide analytics information to website administrators.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">2. How We Use Cookies</h2>
          <p>
            We use cookies to:
            <br />
            - Keep you signed in to your travel agent session.
            <br />
            - Remember your search preferences (destinations, dates, themes).
            <br />
            - Monitor website traffic patterns and user flows to optimize loading speeds and layout usability.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">3. Managing Your Cookies</h2>
          <p>
            You can control or block cookies at any time through your browser settings. However, disabling cookies entirely may impact some interactive elements of our booking dashboard and agent panel.
          </p>
        </div>
      </section>
    </main>
  );
}
