import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePackage, usePackages, useReviews } from "../lib/useData.js";
import { useSEO } from "../lib/useSEO.js";
import { api } from "../lib/api.js";
import StarRating from "../components/StarRating.jsx";
import PriceTag from "../components/PriceTag.jsx";
import PackageCard from "../components/PackageCard.jsx";
import Carousel from "../components/Carousel.jsx";
import DatePicker from "../components/DatePicker.jsx";
import {
  Icon,
  MapPin,
  Calendar,
  Users as UsersIcon,
  Bus,
  Bed,
  Utensils,
  Send,
  PartyPopper,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  Wallet,
  Check,
  XCircle,
  ChevronDown,
} from "../components/icons/index.jsx";

const getStaysForCategory = (pkg, category) => {
  if (!pkg || !pkg.hotels) return [];
  return pkg.hotels.filter(h => h.category && h.category.toLowerCase() === category.toLowerCase());
};

const getItineraryHotelName = (originalName, category, pkg) => {
  if (!pkg || !pkg.hotels) return null;
  
  let city = "";
  if (originalName.toLowerCase().includes("jaipur")) city = "jaipur";
  else if (originalName.toLowerCase().includes("jodhpur")) city = "jodhpur";
  else if (originalName.toLowerCase().includes("udaipur")) city = "udaipur";
  
  if (city) {
    const matchedHotel = pkg.hotels.find(
      h => h.category && h.category.toLowerCase() === category.toLowerCase() && h.name.toLowerCase().includes(city)
    );
    if (matchedHotel) return matchedHotel.name;
  }
  
  const matchedHotelByName = pkg.hotels.find(
    h => h.name.toLowerCase() === originalName.toLowerCase() && h.category && h.category.toLowerCase() === category.toLowerCase()
  );
  return matchedHotelByName ? matchedHotelByName.name : null;
};

function StayCard({ stay }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const gallery = stay.gallery || stay.images || (stay.image ? [stay.image] : []);
  const currentImage = gallery[activeImageIdx] || stay.image;
  const hasImage = !!currentImage;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-[var(--color-off-white)] p-4 flex flex-col sm:flex-row gap-4">
      {hasImage && (
        <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-44">
          <div className="h-32 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
            <img
              src={currentImage}
              alt={stay.name}
              className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full scrollbar-thin">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImageIdx(i)}
                  className={`relative h-8 w-12 flex-shrink-0 overflow-hidden rounded-md border-2 transition cursor-pointer ${
                    activeImageIdx === i ? "border-[var(--color-pink)] scale-95" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--color-navy)] leading-snug">
                {stay.name}
              </h3>
              <div className="mt-0.5 text-xs text-gray-500 font-medium capitalize">
                {stay.propertyType || "Hotel"}
              </div>
            </div>
            {stay.starCategory > 0 && (
              <span className="flex-shrink-0 rounded-full bg-[var(--color-gold)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-gold)]">
                {"★".repeat(stay.starCategory)}
              </span>
            )}
          </div>
          {stay.address && (
            <div className="mt-2 flex items-start gap-1 text-xs text-gray-600 leading-normal">
              <span className="mt-0.5 flex-shrink-0 text-gray-400">
                <Icon size={12}><MapPin /></Icon>
              </span>
              <span>{stay.address}</span>
            </div>
          )}
          {stay.description && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {stay.description}
            </p>
          )}
        </div>
        {stay.mapUrl && (
          <div className="mt-3">
            <a
              href={stay.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-pink)] hover:underline"
            >
              View on map →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = ["Overview", "Itinerary", "Stays", "Inclusions", "Policy", "Reviews"];

const MEAL_LABELS = {
  B: "Breakfast",
  CP: "Continental Plan (Breakfast)",
  MAP: "Breakfast + Dinner",
  AP: "All Meals",
};

export default function ProductPage() {
  const { slug } = useParams();
  const { data: pkg, loading } = usePackage(slug);
  const { data: allPackages } = usePackages();
  const { data: pkgReviews } = useReviews(slug);
  const [tab, setTab] = useState("Overview");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [enquiry, setEnquiry] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mobileSheet, setMobileSheet] = useState(false);
  const [stayCategory, setStayCategory] = useState("standard");
  const [expandedDays, setExpandedDays] = useState({ 1: true });

  const toggleDay = (d) => {
    setExpandedDays((prev) => ({
      ...prev,
      [d]: !prev[d],
    }));
  };

  const expandAll = () => {
    if (!pkg?.itinerary) return;
    const next = {};
    pkg.itinerary.forEach((d) => {
      next[d.day] = true;
    });
    setExpandedDays(next);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  useEffect(() => {
    if (!mobileSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setMobileSheet(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileSheet]);

  useEffect(() => {
    if (pkg) {
      if (!pkg.hotels || pkg.hotels.length === 0) {
        if (tab === "Stays") setTab("Overview");
      } else {
        const available = Array.from(new Set(
          pkg.hotels.map(h => h.category?.toLowerCase()).filter(Boolean)
        ));
        const order = ["standard", "deluxe", "luxury"];
        const active = order.find(cat => available.includes(cat)) || available[0];
        if (active) {
          setStayCategory(active);
        }
      }
    }
  }, [pkg]);

  useSEO(pkg ? {
    title: pkg.metaTitle || `${pkg.title} | Pinkfoot Travel`,
    description: pkg.metaDescription
      || (pkg.description ? pkg.description.replace(/<[^>]+>/g, "").slice(0, 160) : `${pkg.title} — ${pkg.duration.nights}N/${pkg.duration.days}D from ₹${pkg.price.adult.toLocaleString("en-IN")}`),
    keywords: pkg.metaKeywords,
    image: pkg.coverImage,
  } : {});

  if (loading) {
    return <main className="container-page pt-32 pb-20 text-center text-gray-500">Loading package…</main>;
  }
  if (!pkg) {
    return (
      <main className="container-page pt-32 pb-20 text-center">
        <h1 className="font-display text-3xl text-[var(--color-navy)]">Package not found</h1>
        <Link to="/search" className="btn-primary mt-6 inline-flex">Browse all packages</Link>
      </main>
    );
  }

  // Hooks must be called unconditionally; placed after the early returns above
  //   would crash. usePackage/usePackages/useReviews are already at the top.
  // useSEO sits here because pkg may be null in the early-return branch.
  // (We call it once with safe fallbacks.)

  const currentPricing = pkg.categoryPricing?.[stayCategory] || {
    priceAdult: pkg.price?.adult || 0,
    priceChild: pkg.price?.child || 0,
    originalPriceAdult: pkg.originalPrice || 0,
    discount: pkg.discount || 0
  };

  const priceAdult = currentPricing.priceAdult;
  const priceChild = currentPricing.priceChild;
  const originalPrice = currentPricing.originalPriceAdult;
  const discount = currentPricing.discount;
  const total = adults * priceAdult + children * priceChild;

  const availableCategories = Array.from(new Set(
    (pkg.hotels || [])
      .map(h => h.category?.toLowerCase())
      .filter(Boolean)
  ));
  const order = ["standard", "deluxe", "luxury"];
  const activeCategories = order.filter(cat => availableCategories.includes(cat));
  const otherCategories = availableCategories.filter(cat => !order.includes(cat));
  const allCategories = [...activeCategories, ...otherCategories];

  const tabs = ["Overview", "Itinerary"];
  if (pkg.hotels && pkg.hotels.length > 0) {
    tabs.push("Stays");
  }
  tabs.push("Inclusions", "Policy", "Reviews");

  const similar = (allPackages || [])
    .filter((p) => p.id !== pkg.id && (p.destination === pkg.destination || p.theme.some((t) => pkg.theme.includes(t))))
    .slice(0, 3);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      await api.createLead({
        packageSlug: pkg.slug,
        packageTitle: pkg.title,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        travelers: `${adults} adult${adults > 1 ? "s" : ""}${children ? ` + ${children} child${children > 1 ? "ren" : ""}` : ""}`,
        travelDate: date,
        message: `${enquiry.message || ""}\n[Stay Category: ${stayCategory.charAt(0).toUpperCase() + stayCategory.slice(1)}]`,
      });
      setSubmitted(true);
    } catch (err) {
      // backend offline → still mark as submitted so guest gets confirmation; persist locally
      try {
        const queue = JSON.parse(localStorage.getItem("pinkfoot_leads_queue") || "[]");
        queue.push({ ...enquiry, packageSlug: pkg.slug, packageTitle: pkg.title, adults, children, date, stayCategory, at: new Date().toISOString() });
        localStorage.setItem("pinkfoot_leads_queue", JSON.stringify(queue));
        setSubmitted(true);
      } catch {
        setSubmitError(err.message);
      }
    }
  };

  return (
    <main className="bg-[var(--color-off-white)] pt-[72px]">
      {/* HERO with breadcrumb */}
      <section className="relative h-[420px] overflow-hidden">
        <img
          src={pkg.gallery?.[activeImage] || pkg.coverImage}
          alt={pkg.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/90 via-[var(--color-navy)]/40 to-[var(--color-navy)]/20" />
        <div className="container-page absolute inset-x-0 bottom-8 text-white">
          <div className="flex items-center gap-2 text-xs opacity-80">
            <Link to="/" className="hover:underline">Home</Link>
            <span>›</span>
            <Link to="/search" className="hover:underline">Packages</Link>
            <span>›</span>
            <Link to={`/destinations/${pkg.destination}`} className="hover:underline">{pkg.destinationName}</Link>
            <span>›</span>
            <span className="opacity-70">{pkg.title}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="badge-pink">{pkg.badge}</span>
            {pkg.theme.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                {t}
              </span>
            ))}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl"
          >
            {pkg.title}
          </motion.h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5"><Icon size={14}><MapPin /></Icon>{pkg.destinationName}</span>
            <span className="inline-flex items-center gap-1.5"><Icon size={14}><Calendar /></Icon>{pkg.duration.nights} Nights / {pkg.duration.days} Days</span>
            <StarRating rating={pkg.rating} reviewCount={pkg.reviewCount} />
          </div>
        </div>
      </section>

      {/* Gallery thumbs */}
      {pkg.gallery?.length > 1 && (
        <div className="container-page mt-6 mb-8 flex gap-2 overflow-x-auto pb-2">
          {pkg.gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                activeImage === i ? "border-[var(--color-pink)]" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="h-20 w-28 object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="container-page grid gap-8 pb-24 lg:pb-20 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="sticky top-[72px] z-30 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-[var(--shadow-card)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-[var(--color-pink)] text-white shadow-sm"
                    : "text-gray-700 hover:bg-[var(--color-pink-pale)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                  <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
                    Trip Overview
                  </h2>
                  {pkg.description ? (
                    <div
                      className="prose mt-3 max-w-none text-gray-700 [&_p]:mt-3 [&_p]:leading-relaxed [&_p:first-child]:mt-0"
                      dangerouslySetInnerHTML={{ __html: pkg.description }}
                    />
                  ) : (
                    <p className="mt-3 leading-relaxed text-gray-700">
                      {pkg.duration.nights} unforgettable nights across {pkg.destinationName}, designed for {pkg.theme.join(", ").toLowerCase()} travellers. Every transfer, hotel, and guided experience is taken care of — you just show up and enjoy.
                    </p>
                  )}
                  {pkg.tags?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {pkg.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--color-pink-pale)] px-3 py-1 text-[11px] font-semibold text-[var(--color-pink)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                  <h3 className="font-display text-xl font-bold text-[var(--color-navy)]">
                    Trip Highlights
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {pkg.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[var(--color-pink-pale)] text-[var(--color-pink)]">
                          <Icon size={11}><Check /></Icon>
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                {pkg.transfers?.length > 0 && (
                  <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                    <h3 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--color-navy)]">
                      <Icon size={20} className="text-[var(--color-pink)]"><Bus /></Icon> Transfers
                    </h3>
                    <ul className="mt-4 divide-y divide-gray-100">
                      {pkg.transfers.map((t) => (
                        <li key={t.id || t.title} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-semibold text-[var(--color-navy)]">{t.title}</div>
                            <div className="text-xs text-gray-500">{t.vehicle}</div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <Icon size={12}><UsersIcon /></Icon> up to {t.occupancy} pax · {t.sharing || "Private"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {tab === "Itinerary" && (
              <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
                      Day-by-Day Itinerary
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Click on any day to see details, meals, and stays.
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    <button
                      onClick={expandAll}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:border-[var(--color-pink)] hover:text-[var(--color-pink)] transition cursor-pointer"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAll}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:border-[var(--color-pink)] hover:text-[var(--color-pink)] transition cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                <ol className="relative space-y-6 border-l-2 border-[var(--color-pink-pale)] pl-8">
                  {pkg.itinerary.map((day) => (
                    <li key={day.day} className="relative">
                      {/* Accordion Trigger/Header */}
                      <span className={`absolute -left-[49px] grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-md transition-colors duration-250 cursor-pointer ${
                        expandedDays[day.day] ? "bg-[var(--color-pink)] text-white" : "bg-white text-gray-700 border border-gray-200"
                      }`} onClick={() => toggleDay(day.day)}>
                        {day.day}
                      </span>
                      
                      <div
                        onClick={() => toggleDay(day.day)}
                        className="flex items-start justify-between gap-3 cursor-pointer group select-none"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-base sm:text-lg font-bold text-[var(--color-navy)] group-hover:text-[var(--color-pink)] transition-colors duration-150">
                            Day {day.day}: {day.title}
                          </h3>
                          {day.location && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[var(--color-pink)]">
                              <Icon size={11}><MapPin /></Icon> {day.location}
                            </div>
                          )}
                          {!expandedDays[day.day] && day.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-1 max-w-xl">
                              {day.description.replace(/<[^>]+>/g, "")}
                            </p>
                          )}
                        </div>
                        <motion.span
                          animate={{ rotate: expandedDays[day.day] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 text-gray-400 group-hover:text-[var(--color-pink)] transition-colors"
                        >
                          <Icon size={16}><ChevronDown /></Icon>
                        </motion.span>
                      </div>

                      {/* Collapsible Content */}
                      <motion.div
                        initial={false}
                        animate={{ height: expandedDays[day.day] ? "auto" : 0, opacity: expandedDays[day.day] ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2">
                          {/* TODO(security): Render rich HTML from trusted admin input. Ideally, we should sanitize this with DOMPurify, but package.json has no DOMPurify dependency. */}
                          <div
                            className="prose text-sm leading-relaxed text-gray-600 [&_p]:mt-2 [&_p]:leading-relaxed [&_p:first-child]:mt-0"
                            dangerouslySetInnerHTML={{ __html: day.description || "" }}
                          />
                          {(day.meals || day.transferSharing) && (
                            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                              {day.meals && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                                  <Icon size={11}><Utensils /></Icon> {MEAL_LABELS[day.meals] || day.meals}
                                </span>
                              )}
                              {day.transferSharing && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                                  <Icon size={11}><Bus /></Icon> {day.transferSharing}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tab === "Stays" && (
              <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
                      Where You'll Stay
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Carefully selected heritage and luxury stays across your route.
                    </p>
                  </div>
                  {allCategories.length > 1 && (
                    <div className="flex gap-1.5 rounded-xl bg-[var(--color-navy-light)] p-1">
                      {allCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStayCategory(cat)}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                            stayCategory === cat
                              ? "bg-[var(--color-pink)] text-white shadow-sm"
                              : "text-gray-600 hover:text-[var(--color-navy)]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {getStaysForCategory(pkg, stayCategory).length > 0 ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {getStaysForCategory(pkg, stayCategory).map((h) => (
                      <StayCard key={h.id || h.name} stay={h} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Stay details will be shared at booking confirmation.
                  </p>
                )}
              </div>
            )}

            {tab === "Policy" && (
              <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
                  Payment & Cancellation Policy
                </h2>
                {pkg.paymentPolicies && pkg.paymentPolicies.length > 0 ? (
                  <div className="mt-4 space-y-6">
                    {pkg.paymentPolicies.map((policy, idx) => (
                      <div key={policy.id || idx} className={idx > 0 ? "border-t border-gray-100 pt-6" : ""}>
                        {policy.name && (
                          <div className="inline-block rounded-full bg-[var(--color-navy)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                            {policy.name}
                          </div>
                        )}
                        <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700 text-sm">
                          {policy.terms}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : pkg.paymentPolicy?.terms ? (
                  <>
                    {pkg.paymentPolicy.name && (
                      <div className="mt-3 inline-block rounded-full bg-[var(--color-navy)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        {pkg.paymentPolicy.name}
                      </div>
                    )}
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-700 text-sm">
                      {pkg.paymentPolicy.terms}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">
                    Standard terms apply. Share your travel dates and we'll send a tailored payment schedule.
                  </p>
                )}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--color-off-white)] p-4 text-center">
                    <div className="mx-auto inline-grid h-10 w-10 place-items-center rounded-full bg-[var(--color-pink-pale)] text-[var(--color-pink)]">
                      <Icon size={20} animateOnHover><Shield /></Icon>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[var(--color-navy)]">No booking fee</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-off-white)] p-4 text-center">
                    <div className="mx-auto inline-grid h-10 w-10 place-items-center rounded-full bg-[var(--color-pink-pale)] text-[var(--color-pink)]">
                      <Icon size={20} animateOnHover><Wallet /></Icon>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[var(--color-navy)]">Secure payment</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-off-white)] p-4 text-center">
                    <div className="mx-auto inline-grid h-10 w-10 place-items-center rounded-full bg-[var(--color-pink-pale)] text-[var(--color-pink)]">
                      <Icon size={20} animateOnHover><Phone /></Icon>
                    </div>
                    <div className="mt-1 text-xs font-bold text-[var(--color-navy)]">24/7 support</div>
                  </div>
                </div>
              </div>
            )}

            {tab === "Inclusions" && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                  <h3 className="font-display text-xl font-bold text-[var(--color-navy)]">
                    ✅ Inclusions
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {pkg.inclusions.map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-[var(--color-green)]"><Icon size={14}><Check /></Icon></span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                  <h3 className="font-display text-xl font-bold text-[var(--color-navy)]">
                    ❌ Exclusions
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {pkg.exclusions.map((exc) => (
                      <li key={exc} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-[var(--color-pink)]"><Icon size={14}><XCircle /></Icon></span>
                        {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "Reviews" && (
              <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-[var(--color-navy)]">
                    Traveller Reviews
                  </h3>
                  <StarRating rating={pkg.rating} reviewCount={pkg.reviewCount} />
                </div>
                {(pkgReviews || []).length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    Be one of the first to leave a review after your trip.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-5">
                    {(pkgReviews || []).map((r) => (
                      <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--color-pink), var(--color-navy-mid))",
                            }}
                          >
                            {r.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[var(--color-navy)]">
                              {r.name}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {r.location} {r.date && `· ${r.date}`}
                            </div>
                          </div>
                          <div className="ml-auto">
                            <StarRating rating={r.rating} showValue={false} />
                          </div>
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-gray-700">
                          {r.comment}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </motion.div>

          {similar.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-navy)]">
                You may also like
              </h2>
              <Carousel itemClassName="w-[280px] sm:w-[320px]" gap={20}>
                {similar.map((p, i) => (
                  <PackageCard key={p.id} pkg={p} index={i} />
                ))}
              </Carousel>
            </div>
          )}
        </div>

        <aside className="hidden min-w-0 space-y-4 lg:block">
          <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
            <BookingBody
              pkg={pkg}
              date={date} setDate={setDate}
              adults={adults} setAdults={setAdults}
              children={children} setChildren={setChildren}
              total={total}
              onSendEnquiry={() => document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" })}
              onShowPolicy={() => setTab("Policy")}
              stayCategory={stayCategory} setStayCategory={setStayCategory}
              priceAdult={priceAdult}
              priceChild={priceChild}
              allCategories={allCategories}
              originalPrice={originalPrice}
              discount={discount}
            />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-pink-mid)]/40 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(27,42,74,0.12)] lg:hidden">
        <div className="container-page flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">From</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-extrabold tabular-nums text-[var(--color-navy)]">
                ₹{priceAdult.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-gray-500">/person</span>
              {discount > 0 && (
                <span className="ml-1 badge-green !px-1.5 !py-0 !text-[9px]">{discount}% OFF</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSheet(true)}
            className="btn-primary !px-5 !py-2.5 !text-sm whitespace-nowrap"
          >
            <Icon size={14} animateOnHover><Send /></Icon> Check Price
          </button>
        </div>
        <div className="pb-[max(0px,env(safe-area-inset-bottom))]" />
      </div>

      <AnimatePresence>
        {mobileSheet && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSheet(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(27,42,74,0.25)]"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-[var(--color-navy)]">
                  {pkg.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileSheet(false)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Icon size={16}><XCircle /></Icon>
                </button>
              </div>
              <BookingBody
                pkg={pkg}
                date={date} setDate={setDate}
                adults={adults} setAdults={setAdults}
                children={children} setChildren={setChildren}
                total={total}
                onSendEnquiry={() => {
                  setMobileSheet(false);
                  setTimeout(() => {
                    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
                onShowPolicy={() => { setMobileSheet(false); setTab("Policy"); }}
                stayCategory={stayCategory} setStayCategory={setStayCategory}
                priceAdult={priceAdult}
                priceChild={priceChild}
                allCategories={allCategories}
                originalPrice={originalPrice}
                discount={discount}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section id="enquiry-form" className="bg-white py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="badge-pink inline-flex items-center gap-1.5">
              <Icon size={12}><MessageCircle /></Icon> Quick Enquiry
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-navy)]">
              Talk to a Pinkfoot trip designer
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              Share a few details and we'll send a tailored quote within 1 hour during business hours. Customisations welcome — flights, hotel upgrades, extensions, the works.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-700">
              {["Free customisation", "Best price guarantee", "Reply in under 1 hour"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-[var(--color-green)]"><Icon size={14}><Check /></Icon></span>{t}
                </li>
              ))}
            </ul>
          </div>
          <form
            onSubmit={submit}
            className="rounded-2xl bg-[var(--color-off-white)] p-7 shadow-[var(--shadow-card)]"
          >
            {submitted ? (
              <div className="text-center">
                <div className="mx-auto inline-block text-[var(--color-pink)]">
                  <Icon size={48} animate><PartyPopper /></Icon>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold text-[var(--color-navy)]">
                  Thanks, {enquiry.name.split(" ")[0] || "traveller"}!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've received your enquiry for <b>{pkg.title}</b>. A trip designer will reach out at {enquiry.email || enquiry.phone} shortly.
                </p>
              </div>
            ) : (
              <>
                <Field label="Your Name" required>
                  <input
                    required
                    value={enquiry.name}
                    onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" required>
                    <input
                      required
                      type="email"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
                    />
                  </Field>
                  <Field label="Phone" required>
                    <input
                      required
                      type="tel"
                      value={enquiry.phone}
                      onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
                    />
                  </Field>
                </div>
                <Field label="Special Requests / Travel Window">
                  <textarea
                    rows={3}
                    value={enquiry.message}
                    onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                    placeholder="e.g., Travel between Dec 18–26, prefer beachfront hotel, vegetarian meals"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
                  />
                </Field>
                <button type="submit" className="btn-primary mt-3 w-full">
                  Get Free Quote
                </button>
                {submitError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-2 text-center text-xs text-red-700">
                    {submitError}
                  </div>
                )}
                <p className="mt-3 text-center text-[11px] text-gray-500">
                  We respect your privacy. No spam, ever.
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

function BookingBody({
  pkg,
  date, setDate,
  adults, setAdults,
  children, setChildren,
  total,
  onSendEnquiry,
  onShowPolicy,
  stayCategory, setStayCategory,
  priceAdult,
  priceChild,
  allCategories = [],
  originalPrice,
  discount,
}) {
  return (
    <>
      <PriceTag
        price={priceAdult}
        original={originalPrice}
        discount={discount}
      />
      <div className="mt-1 text-xs text-gray-500">per adult, taxes included</div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
            Travel Date
          </label>
          <DatePicker value={date} onChange={setDate} placeholder="When are you travelling?" />
        </div>
        <Counter label="Adults" value={adults} setValue={setAdults} min={1} />
        <Counter label="Children" value={children} setValue={setChildren} min={0} />

        {/* Stay Category Dropdown */}
        {allCategories.length > 0 && (
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Stay Category
            </label>
            {allCategories.length > 1 ? (
              <select
                value={stayCategory}
                onChange={(e) => setStayCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-[var(--color-pink)] transition cursor-pointer"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} Stay
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-semibold text-gray-700 capitalize">
                {stayCategory} Stay
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
        <Row label={`Adults × ${adults}`} value={`₹${(adults * priceAdult).toLocaleString("en-IN")}`} />
        {children > 0 && (
          <Row label={`Children × ${children}`} value={`₹${(children * priceChild).toLocaleString("en-IN")}`} />
        )}
        <div className="my-2 h-px bg-gray-100" />
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-gray-700">Total</span>
          <span className="font-display text-2xl font-extrabold text-[var(--color-pink)] tabular-nums">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <button onClick={onSendEnquiry} className="btn-primary mt-5 w-full">
        <Icon size={16} animateOnHover><Send /></Icon> Send Enquiry
      </button>
      <button className="btn-outline mt-2 w-full">
        <Icon size={16} animateOnHover><Phone /></Icon> Talk to an Expert
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1"><Icon size={12}><Shield /></Icon> No booking fee</span>
        <span>·</span>
        <span>Free cancellation 7+ days prior</span>
      </div>

      {pkg.paymentPolicies && pkg.paymentPolicies.length > 0 ? (
        <div className="space-y-2.5 mt-5">
          {pkg.paymentPolicies.map((policy, idx) => (
            <div key={policy.id || idx} className="rounded-xl border border-[var(--color-pink-pale)] bg-[var(--color-pink-pale)]/40 p-3 text-[11px]">
              <div className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--color-pink)]">
                <Icon size={12}><Wallet /></Icon> {policy.name || "Payment plan"}
              </div>
              <button
                onClick={onShowPolicy}
                className="mt-1 line-clamp-2 text-left text-gray-600 hover:text-[var(--color-navy)] w-full block"
              >
                {policy.terms}
              </button>
            </div>
          ))}
        </div>
      ) : pkg.paymentPolicy ? (
        <div className="mt-5 rounded-xl border border-[var(--color-pink-pale)] bg-[var(--color-pink-pale)]/40 p-3 text-[11px]">
          <div className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--color-pink)]">
            <Icon size={12}><Wallet /></Icon> {pkg.paymentPolicy.name || "Payment plan"}
          </div>
          <button
            onClick={onShowPolicy}
            className="mt-1 line-clamp-2 text-left text-gray-600 hover:text-[var(--color-navy)] w-full block"
          >
            {pkg.paymentPolicy.terms}
          </button>
        </div>
      ) : null}
    </>
  );
}

function Counter({ label, value, setValue, min = 0 }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
        {label}
      </label>
      <div className="flex items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-pink-pale)] text-lg font-bold text-[var(--color-pink)]"
        >
          −
        </button>
        <span className="text-sm font-bold text-[var(--color-navy)]">{value}</span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-pink-pale)] text-lg font-bold text-[var(--color-pink)]"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-[var(--color-navy)]">{value}</span>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
        {label} {required && <span className="text-[var(--color-pink)]">*</span>}
      </label>
      {children}
    </div>
  );
}
