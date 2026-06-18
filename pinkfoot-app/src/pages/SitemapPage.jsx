import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader.jsx";
import { Icon, Globe, MapPin, Phone } from "../components/icons/index.jsx";

export default function SitemapPage() {
  const sections = [
    {
      title: "Explore",
      icon: Globe,
      links: [
        { label: "Home", to: "/" },
        { label: "Destinations", to: "/destinations" },
        { label: "Packages", to: "/search" },
        { label: "About Us", to: "/about" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
    {
      title: "Themes",
      icon: MapPin,
      links: [
        { label: "Honeymoon", to: "/search?theme=Honeymoon" },
        { label: "Family", to: "/search?theme=Family" },
        { label: "Adventure", to: "/search?theme=Adventure" },
        { label: "Luxury", to: "/search?theme=Luxury" },
        { label: "Beach", to: "/search?theme=Beach" },
        { label: "Culture", to: "/search?theme=Culture" },
      ],
    },
    {
      title: "Legal & Support",
      icon: Phone,
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Cookie Policy", to: "/cookies" },
        { label: "Agent Login", to: "/admin/login" },
      ],
    },
  ];

  return (
    <main className="pt-[72px]">
      <section className="bg-[var(--color-pink-pale)] py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Directory"
            title="Sitemap"
            subtitle="Find your way around the Pinkfoot Travel website."
          />
        </div>
      </section>
      <section className="container-page py-20">
        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
          {sections.map((sec) => (
            <div key={sec.title} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] border border-[var(--color-pink-pale)]/60">
              <div className="flex items-center gap-3 mb-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-pink-pale)] text-[var(--color-pink)]">
                  <Icon size={20}><sec.icon /></Icon>
                </span>
                <h2 className="font-display text-lg font-bold text-[var(--color-navy)]">{sec.title}</h2>
              </div>
              <ul className="space-y-3">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--color-pink)] transition"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-pink)]/40" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
