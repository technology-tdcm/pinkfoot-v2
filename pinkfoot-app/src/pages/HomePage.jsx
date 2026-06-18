import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDestinations, usePackages, useReviews } from "../lib/useData.js";
import DestinationCard from "../components/DestinationCard.jsx";
import PackageCard from "../components/PackageCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StarRating from "../components/StarRating.jsx";
import Carousel from "../components/Carousel.jsx";
import {
  Icon,
  Search as SearchIcon,
  Shield,
  Wallet,
  Phone,
  Sparkles,
  MapPin,
  Calendar,
  Users as UsersIcon,
  Plane,
  Heart,
  Map,
  Award,
  Star,
} from "../components/icons/index.jsx";

const CATEGORIES = ["All", "Honeymoon", "Family", "Adventure", "Luxury", "Beach"];

function AnimatedCounter({ value, suffix = "", duration = 1.6 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const target = value;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / (duration * 1000));
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.floor(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else setN(target);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

const TRAVELLER_TYPES = [
  { id: "couple",  label: "Couple",  IconComp: Heart,     theme: "Honeymoon", caption: "Honeymoons & escapes" },
  { id: "family",  label: "Family",  IconComp: UsersIcon, theme: "Family",    caption: "Kid-friendly fun" },
  { id: "friends", label: "Friends", IconComp: Sparkles,  theme: "Adventure", caption: "Squad adventures" },
  { id: "solo",    label: "Solo",    IconComp: Map,       theme: "Adventure", caption: "On your own terms" },
];

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=2000&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2000&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=2000&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=2000&q=80",
];

function Hero({ destinations }) {
  const navigate = useNavigate();
  const [traveller, setTraveller] = useState(null);
  const [query, setQuery] = useState("");
  const [slide, setSlide] = useState(0);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSlide((i) => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Preload slides once
  useEffect(() => {
    HERO_SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const suggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return destinations
      .filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.country?.toLowerCase().includes(q) ||
        d.region?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, destinations]);

  const onTravellerClick = (t) => {
    setTraveller(t.id);
    navigate(`/search?theme=${encodeURIComponent(t.theme)}`);
  };

  const onSubmit = (e) => {
    e?.preventDefault?.();
    if (suggestions[0]) {
      navigate(`/destinations/${suggestions[0].slug}`);
      return;
    }
    const q = new URLSearchParams();
    if (query) q.set("q", query);
    if (traveller) {
      const t = TRAVELLER_TYPES.find((x) => x.id === traveller);
      if (t) q.set("theme", t.theme);
    }
    navigate(`/search${q.toString() ? `?${q.toString()}` : ""}`);
  };

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Cinematic crossfade slideshow */}
      <div className="absolute inset-0 -z-20">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: i === slide ? "kenburns 9s ease-out forwards" : "none",
            }}
          />
        ))}
        {/* Overlay for text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(27,42,74,0.55) 0%, rgba(27,42,74,0.45) 35%, rgba(27,42,74,0.85) 100%)",
          }}
        />
        {/* Pink glow accents */}
        <div
          className="absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,84,120,0.25), transparent 70%)" }}
        />
        <div
          className="absolute -right-24 bottom-0 h-[460px] w-[460px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,118,143,0.22), transparent 70%)" }}
        />
      </div>

      <div className="container-page relative z-10 w-full pt-28 pb-12 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-pink)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-pink)]" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
            Handcrafted holidays · Since 2018
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mx-auto mt-6 max-w-5xl font-display text-[clamp(44px,6.5vw,84px)] font-bold leading-[1.02] text-white"
        >
          Who's coming{" "}
          <span className="relative inline-block">
            <span className="text-[var(--color-pink-light)]">along</span>
            <svg
              className="absolute -bottom-3 left-0 w-full"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M2 8 Q 50 0, 100 6 T 198 4"
                stroke="#E85478"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          ?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Tell us who's travelling — we'll handcraft a trip designed exactly for you.
        </motion.p>

        {/* Pill search */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="relative mx-auto mt-10 max-w-2xl"
        >
          <div className="relative flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_18px_45px_rgba(27,42,74,0.35)]">
            <Icon size={20} animateOnHover className="flex-shrink-0 text-gray-400">
              <SearchIcon />
            </Icon>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              placeholder="Search countries, cities…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-[var(--color-navy)] placeholder-gray-400 outline-none"
            />
            <button type="submit" className="btn-primary !rounded-full !px-6 !py-3 !text-sm">
              Search
            </button>
          </div>

          <AnimatePresence>
            {showSuggest && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute inset-x-2 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-[var(--shadow-heavy)]"
              >
                {suggestions.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { navigate(`/destinations/${d.slug}`); setShowSuggest(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-[var(--color-pink-pale)]"
                    >
                      <img src={d.heroImage} alt="" className="h-10 w-12 flex-shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[var(--color-navy)]">{d.name}</div>
                        <div className="truncate text-[11px] text-gray-500">{d.country} · {d.region}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--color-pink)]">
                        From ₹{d.startFrom.toLocaleString("en-IN")}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
            <span className="font-semibold">Trending:</span>
            {["Maldives", "Bali", "Europe", "Dubai", "Honeymoon"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const d = destinations.find((x) => x.name.toLowerCase() === t.toLowerCase());
                  navigate(d ? `/destinations/${d.slug}` : `/search?theme=${encodeURIComponent(t)}`);
                }}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur transition hover:border-white/60 hover:bg-white/20"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.form>

        {/* Compact traveller-type chips below the search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Travelling as
          </span>
          {TRAVELLER_TYPES.map((t) => {
            const active = traveller === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTravellerClick(t)}
                aria-pressed={active}
                title={t.caption}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  active
                    ? "border-[var(--color-pink)] bg-[var(--color-pink)]/25 text-white"
                    : "border-white/25 bg-white/10 text-white/90 backdrop-blur hover:border-white/50 hover:bg-white/15"
                }`}
              >
                <Icon size={13} animateOnHover><t.IconComp /></Icon>
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* Trust strip — small, single-line on desktop, pushed slightly lower */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mx-auto mt-16 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[11px] text-white/85"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["PS", "RS", "AP", "NK"].map((a, i) => (
                <div
                  key={a}
                  className="grid h-6 w-6 place-items-center rounded-full border-2 border-white/90 text-[9px] font-bold text-white"
                  style={{
                    background:
                      i % 2
                        ? "linear-gradient(135deg, #E85478, #2D4272)"
                        : "linear-gradient(135deg, #2D4272, #E85478)",
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--color-gold)] text-[10px] leading-none">★★★★★</span>
              <span className="font-bold text-white">4.8</span>
              <span className="text-white/65">· 8,250+ reviews</span>
            </div>
          </div>

          <span className="hidden h-3.5 w-px bg-white/20 md:block" />

          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-green)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" />
            </span>
            <span className="font-bold text-white">
              <AnimatedCounter value={143} />+ trips
            </span>
            <span className="text-white/65">booked this week</span>
          </div>

          <span className="hidden h-3.5 w-px bg-white/20 md:block" />

          <div className="flex items-center gap-3 uppercase tracking-wider text-white/75">
            <span className="inline-flex items-center gap-1">
              <Icon size={12} animateOnHover><Wallet /></Icon> Best Price
            </span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon size={12} animateOnHover><Phone /></Icon> 24/7 Support
            </span>
          </div>
        </motion.div>

        {/* Slide dots */}
        <div className="mt-10 flex justify-center gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustMarquee() {
  const items = [
    { IconComp: Star,     label: "4.8 / 5 — 10,000+ Reviews" },
    { IconComp: Wallet,   label: "Best Price Guarantee" },
    { IconComp: Phone,    label: "24/7 On-Trip Support" },
    { IconComp: Plane,    label: "40+ Destinations" },
    { IconComp: Award,    label: "TAFI Member" },
    { IconComp: Shield,   label: "RBI Compliant" },
    { IconComp: Sparkles, label: "Premium Partners" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden bg-white py-5 border-y border-[var(--color-pink-pale)]">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)]"
          >
            <Icon size={16} className="text-[var(--color-pink)]"><t.IconComp /></Icon>
            {t.label}
            <span className="ml-8 text-[var(--color-pink)]">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PopularDestinations({ destinations }) {
  return (
    <section className="bg-[var(--color-off-white)] py-20">
      <div className="container-page">
        <SectionHeader
          eyebrow="Popular Destinations"
          title="Where Do You Want to Go?"
          subtitle="Curated destinations loved by thousands of Pinkfoot travellers."
        />
        <Carousel itemClassName="w-[260px] sm:w-[300px] lg:w-[340px]">
          {destinations.slice(0, 8).map((d, i) => (
            <DestinationCard key={d.id} dest={d} index={i} />
          ))}
        </Carousel>
        <div className="mt-12 text-center">
          <Link to="/destinations" className="btn-outline">
            Explore All 40+ Destinations →
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrendingPackages({ packages }) {
  const [cat, setCat] = useState("All");
  const filtered = packages.filter(
    (p) => cat === "All" || p.theme.includes(cat),
  );
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="badge-pink inline-flex items-center gap-1.5">
              <Icon size={12}><Sparkles /></Icon> Trending Now
            </span>
            <h2 className="mt-3 font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight text-[var(--color-navy)]">
              Hand-Picked Holiday Packages
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  cat === c
                    ? "border-[var(--color-pink)] bg-[var(--color-pink)] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[var(--color-pink)] hover:text-[var(--color-pink)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Carousel itemClassName="w-[300px] sm:w-[340px] lg:w-[380px]" gap={24}>
              {filtered.slice(0, 8).map((p, i) => (
                <PackageCard key={p.id} pkg={p} index={i} />
              ))}
            </Carousel>
          </motion.div>
        </AnimatePresence>
        <div className="mt-12 text-center">
          <Link to="/search" className="btn-outline">
            View All Packages →
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyPinkfoot() {
  const items = [
    { Icon: Sparkles, title: "Personalised Itineraries", desc: "Every trip is crafted around your preferences, budget, and travel style." },
    { Icon: Wallet,   title: "Best Price Guarantee",     desc: "We match any like-for-like offer. No hidden charges, ever." },
    { Icon: Shield,   title: "Safe & Trusted",           desc: "Trusted by over 10,000 happy customers since 2018." },
    { Icon: Phone,    title: "24/7 Travel Support",      desc: "Our travel experts are always available, before and during your trip." },
  ];
  return (
    <section
      className="relative overflow-hidden py-20"
      style={{
        background:
          "linear-gradient(135deg, #1B2A4A 0%, #2D3F6A 50%, #3A1840 100%)",
      }}
    >
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--color-pink)]/20 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[var(--color-pink-light)]/15 blur-3xl" />
      <div className="container-page relative">
        <SectionHeader
          light
          eyebrow="Why Pinkfoot"
          title="Why Travel with Pinkfoot?"
          subtitle="We handle every detail so you can focus on the moments."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-7 text-center transition-all hover:-translate-y-1 hover:bg-white/[0.1]"
            >
              <div className="mx-auto mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-pink)]/20 text-[var(--color-pink-light)] transition-transform group-hover:scale-110">
                <Icon size={28} animateOnView animateOnViewOnce={false}>
                  <item.Icon />
                </Icon>
              </div>
              <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ reviews }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!reviews.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % reviews.length), 5500);
    return () => clearInterval(id);
  }, [reviews.length]);
  if (!reviews.length) return null;
  const r = reviews[idx % reviews.length];
  return (
    <section className="bg-[var(--color-pink-pale)] py-20">
      <div className="container-page">
        <SectionHeader
          eyebrow="Testimonials"
          title="Stories from Our Travellers"
          subtitle="Real reviews from real travellers — the only marketing we truly believe in."
        />
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl bg-white p-10 shadow-[var(--shadow-card)]"
            >
              <div className="font-display text-6xl leading-none text-[var(--color-pink)]">"</div>
              <p className="mt-2 text-lg leading-relaxed text-gray-700">{r.comment}</p>
              <div className="mt-6 flex items-center gap-4">
                <div
                  className="grid h-14 w-14 place-items-center rounded-full text-base font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-pink), var(--color-navy-mid))",
                  }}
                >
                  {r.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--color-navy)]">{r.name}</div>
                  <div className="text-xs text-gray-500">
                    {r.location} · {r.package}
                  </div>
                </div>
                <StarRating rating={r.rating} showValue={false} />
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Show review ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8 bg-[var(--color-pink)]" : "w-2 bg-[var(--color-pink-mid)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



export default function HomePage() {
  const { data: destinations } = useDestinations();
  const { data: packages } = usePackages();
  const { data: reviews } = useReviews();
  const dList = destinations || [];
  const pList = packages || [];
  const rList = reviews || [];
  return (
    <main>
      <Hero destinations={dList} />
      <TrustMarquee />
      <PopularDestinations destinations={dList} />
      <TrendingPackages packages={pList} />
      <WhyPinkfoot />
      <Testimonials reviews={rList} />
    </main>
  );
}
