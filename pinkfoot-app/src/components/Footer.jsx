import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDestinations } from "../lib/useData.js";
import {
  Icon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Plane,
  Globe,
  Heart,
} from "./icons/index.jsx";

const linkCols = [
  {
    title: "Packages",
    links: [
      { label: "Honeymoon",     to: "/search?theme=Honeymoon" },
      { label: "Family Trips",  to: "/search?theme=Family" },
      { label: "Adventure",     to: "/search?theme=Adventure" },
      { label: "Luxury",        to: "/search?theme=Luxury" },
      { label: "Beach",         to: "/search?theme=Beach" },
      { label: "Culture",       to: "/search?theme=Culture" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",  to: "/about" },
      { label: "Contact",   to: "/contact" },
      { label: "Blog",      to: "#" },
      { label: "Careers",   to: "#" },
      { label: "Press",     to: "#" },
    ],
  },
];



export default function Footer() {
  const { data: destinations } = useDestinations();
  const featured = (destinations || []).slice(0, 6);

  return (
    <footer className="relative isolate overflow-hidden bg-[var(--color-navy)] text-white">
      {/* Decorative dotted route across the top */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 block h-[60px] w-full opacity-70"
        aria-hidden
      >
        <path
          d="M0 50 Q 240 0, 480 35 T 960 25 T 1440 40"
          stroke="rgba(232,84,120,0.55)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          fill="none"
        />
        <circle cx="6" cy="50" r="3" fill="#E85478" />
        <circle cx="480" cy="35" r="3" fill="#E85478" />
        <circle cx="960" cy="25" r="3" fill="#E85478" />
        <circle cx="1434" cy="40" r="3" fill="#E85478" />
      </svg>

      {/* Glow accents */}
      <div className="absolute -left-32 top-32 -z-10 h-96 w-96 rounded-full bg-[var(--color-pink)]/14 blur-3xl" aria-hidden />
      <div className="absolute -right-40 bottom-0 -z-10 h-[480px] w-[480px] rounded-full bg-[var(--color-pink-light)]/10 blur-3xl" aria-hidden />

      {/* ── Contact band ── */}
      <section className="container-page relative pb-12 pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="badge-pink inline-flex items-center gap-1.5">
              <Icon size={12}><MessageCircle /></Icon> Let's chat
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,3.8vw,42px)] leading-tight">
              Got a dream destination?
              <br />
              <span className="text-[var(--color-pink-light)]">We're listening.</span>
            </h2>
            <p className="mt-3 max-w-md text-white/70">
              Tell us where, when, and your travel style — a Pinkfoot expert crafts the rest within an hour.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { IconComp: Phone,         label: "Call us",   value: "+91 8109030897", href: "tel:+918109030897" },
              { IconComp: MessageCircle, label: "WhatsApp",  value: "+91 8109030897",  href: "https://wa.me/918109030897" },
              { IconComp: Mail,          label: "Email",     value: "info@pinkfoottravel.com", href: "mailto:info@pinkfoottravel.com" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group rounded-2xl border border-white/15 bg-white/[0.06] p-4 transition hover:-translate-y-1 hover:border-[var(--color-pink)]/60 hover:bg-white/[0.12]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-pink)]/20 text-[var(--color-pink-light)] transition group-hover:bg-[var(--color-pink)] group-hover:text-white">
                  <Icon size={17} animateOnHover><c.IconComp /></Icon>
                </div>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/55">
                  {c.label}
                </div>
                <div className="text-sm font-semibold">{c.value}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* ── Main grid ── */}
      <section className="container-page relative py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.8fr_1.4fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <div className="font-display text-2xl text-[var(--color-pink-light)]">
              PINKFOOT TRAVEL
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              Handcrafted international holidays since 2018. From honeymoons to family escapes, every itinerary is built around <em>your</em> way of travelling.
            </p>

            {/* Animated paper-plane route */}
            <div className="relative mt-6 h-12 max-w-[280px]">
              <svg
                viewBox="0 0 260 40"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                <path
                  d="M2 30 Q 60 5, 130 22 T 258 14"
                  stroke="rgba(232,84,120,0.55)"
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                  fill="none"
                />
                <circle cx="2" cy="30" r="3.5" fill="#E85478" />
                <circle cx="258" cy="14" r="3.5" fill="#E85478" />
              </svg>
              <motion.div
                initial={{ x: 0, y: 18 }}
                animate={{ x: 240, y: 2 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-0 text-[var(--color-pink-light)]"
              >
                <Icon size={22}><Plane /></Icon>
              </motion.div>
            </div>

            {/* Socials */}
            <div className="mt-6">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/55">
                Follow the journey
              </div>
              <div className="flex gap-2">
                {[
                  { IconComp: FacebookIcon,  label: "Facebook", href: "https://www.facebook.com/share/14gbkCKE19W/" },
                  { IconComp: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/pinkfoottravel?igsh=cDdwM2d2dmdnMzB5" },
                  { IconComp: TwitterIcon,   label: "Twitter", href: "#" },
                  { IconComp: YoutubeIcon,   label: "YouTube", href: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    {...(s.href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.08] text-white/80 transition hover:-translate-y-0.5 hover:bg-[var(--color-pink)] hover:text-white"
                  >
                    <s.IconComp size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Top destinations with thumbnails */}
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold tracking-wide">
              <Icon size={14} className="text-[var(--color-pink-light)]" animateOnHover><Globe /></Icon>
              Top Destinations
            </div>
            <ul className="space-y-2.5">
              {featured.map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/destinations/${d.slug}`}
                    className="group flex items-center gap-2.5 text-[13px] text-white/70 transition hover:text-[var(--color-pink-light)]"
                  >
                    <img
                      src={d.heroImage}
                      alt=""
                      className="h-8 w-11 flex-shrink-0 rounded-md object-cover transition group-hover:scale-105"
                    />
                    <span className="flex-1 truncate font-semibold">{d.name}</span>
                    <span className="hidden text-[10px] text-white/40 group-hover:text-[var(--color-pink-light)] sm:inline">
                      ₹{Math.round(d.startFrom / 1000)}k+
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/destinations" className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pink-light)] hover:underline">
                  View all destinations →
                </Link>
              </li>
            </ul>
          </div>

          {linkCols.map((col) => (
            <div key={col.title}>
              <div className="mb-4 text-sm font-bold tracking-wide">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="inline-flex items-center gap-1.5 text-[13px] text-white/65 transition hover:gap-2 hover:text-[var(--color-pink-light)]"
                    >
                      <span className="h-1 w-1 rounded-full bg-[var(--color-pink)]/0 transition group-hover:bg-[var(--color-pink)]" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Registered Office */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <a
            href="https://maps.google.com/?q=First+Floor+-+27,+Kailash+Puri,+Opp+Sai+Baba+Mandir,+near+Khandaka+Hospital,+Tonk+Road,+Jaipur+-+302018,+Rajasthan"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 max-w-2xl transition hover:text-[var(--color-pink-light)]"
          >
            <span className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border-2 border-dashed border-white/25 text-[var(--color-pink-light)] group-hover:border-[var(--color-pink-light)]/60">
              <Icon size={14}><MapPin /></Icon>
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white/70">
                Registered Office
              </div>
              <div className="text-sm font-semibold leading-relaxed">
                First Floor - 27, Kailash Puri, Opp Sai Baba Mandir, near Khandaka Hospital, Tonk Road, Jaipur - 302018, Rajasthan
              </div>
            </div>
          </a>
        </div>
      </section>



      {/* ── Bottom bar ── */}
      <div className="relative">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-[12px] text-white/50 md:flex-row md:items-center">
          <div className="inline-flex items-center gap-1">
            © {new Date().getFullYear()} Pinkfoot Travel · Made with
            <span className="text-[var(--color-pink-light)]">
              <Icon size={11}><Heart filled /></Icon>
            </span>
            in India
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="transition hover:text-white/85">Privacy</Link>
            <Link to="/terms" className="transition hover:text-white/85">Terms</Link>
            <Link to="/cookies" className="transition hover:text-white/85">Cookies</Link>
            <Link to="/sitemap" className="transition hover:text-white/85">Sitemap</Link>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Icon size={11}><Globe /></Icon> EN · INR
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
