import SectionHeader from "../components/SectionHeader.jsx";

export default function PrivacyPage() {
  return (
    <main className="pt-[72px]">
      <section className="bg-[var(--color-pink-pale)] py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Legal"
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your personal information at Pinkfoot Travel."
          />
        </div>
      </section>
      <section className="container-page py-20">
        <div className="prose mx-auto max-w-3xl text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg font-semibold text-[var(--color-navy)]">Last Updated: June 18, 2026</p>
          <p>
            At Pinkfoot Travel, we are committed to protecting your privacy. This Privacy Policy details how we handle the personal information you provide to us when booking packages, customizing itineraries, or browsing our website.
          </p>
          
          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">1. Information We Collect</h2>
          <p>
            We collect personal information necessary to organize and manage your travels. This includes your name, email address, phone number, physical address, passport details (when booking international stays), and flight details. We also collect anonymous analytical data about your browsing behavior to optimize the website experience.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">2. How We Use Your Information</h2>
          <p>
            Your information is used to design handcrafted itineraries, make hotel/resort reservations, issue travel vouchers, and coordinate with our trusted ground-staff operators. We will never sell, rent, or trade your personal information with third parties for marketing purposes.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">3. Data Protection and Security</h2>
          <p>
            We deploy secure data transmission protocols (SSL/TLS) and secure storage databases to protect your personal details from unauthorized access, disclosure, or modification. Only authorized trip designers and coordinators have access to your personal files.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">4. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request deletion of your data, please contact us at:
            <br />
            <strong>Email:</strong> info@pinkfoottravel.com
            <br />
            <strong>Phone:</strong> +91 8109030897
          </p>
        </div>
      </section>
    </main>
  );
}
