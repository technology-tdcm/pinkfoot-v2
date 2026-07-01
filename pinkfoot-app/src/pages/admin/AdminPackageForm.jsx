import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import ImageUpload from "../../components/ImageUpload.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

const THEMES = ["Honeymoon", "Family", "Adventure", "Luxury", "Beach", "Culture", "Shopping"];
const BADGES = ["", "Best Seller", "Premium", "Hot Deal", "Family Favourite", "Family Pick", "Weekend Deal"];

const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY = {
  title: "",
  slug: "",
  destination: "",
  destinationName: "",
  theme: [],
  tags: [],
  nights: 5,
  days: 6,
  priceAdult: 0,
  priceChild: 0,
  originalPrice: 0,
  discount: 0,
  rating: 4.5,
  reviewCount: 0,
  badge: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  inclusions: [],
  exclusions: [],
  highlights: [],
  itinerary: [],
  hotels: [],
  transfers: [],
  paymentPolicies: [],
  categoryPricing: {
    standard: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 },
    deluxe: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 },
    luxury: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 }
  },
  published: true,
};

export default function AdminPackageForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [destinations, setDestinations] = useState([]);
  const [stays, setStays] = useState([]);
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingCover, setExistingCover] = useState("");
  const [existingGallery, setExistingGallery] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.adminListDestinations().then(setDestinations).catch(() => {});
    api.adminListStays().then(setStays).catch(() => {});
    api.adminListPolicies().then(setAvailablePolicies).catch(() => {});
    if (isEdit) {
      api.adminListPackages().then((items) => {
        const p = items.find((x) => x.id === id);
        if (!p) return;
        setForm({
          title: p.title,
          slug: p.slug,
          destination: p.destination,
          destinationName: p.destinationName,
          theme: p.theme,
          tags: p.tags || [],
          nights: p.duration.nights,
          days: p.duration.days,
          priceAdult: p.price.adult,
          priceChild: p.price.child,
          originalPrice: p.originalPrice || 0,
          discount: p.discount || 0,
          rating: p.rating,
          reviewCount: p.reviewCount,
          badge: p.badge || "",
          description: p.description || "",
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
          metaKeywords: p.metaKeywords || "",
          inclusions: p.inclusions || [],
          exclusions: p.exclusions || [],
          highlights: p.highlights || [],
          itinerary: p.itinerary || [],
          hotels: p.hotels || [],
          transfers: p.transfers || [],
          paymentPolicies: p.paymentPolicies || [],
          categoryPricing: p.categoryPricing || {
            standard: { originalPriceAdult: p.originalPrice || 0, originalPriceChild: p.price?.child || 0, discount: p.discount || 0, priceAdult: p.price?.adult || 0, priceChild: p.price?.child || 0 },
            deluxe: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 },
            luxury: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 }
          },
          published: p.published,
        });
        setExistingCover(p.coverImage || "");
        setExistingGallery(p.gallery || []);
      });
    }
  }, [id, isEdit]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTheme = (t) =>
    update("theme", form.theme.includes(t) ? form.theme.filter((x) => x !== t) : [...form.theme, t]);

  const handleTierPriceChange = (tier, field, val) => {
    setForm((f) => {
      const currentPricing = f.categoryPricing || {
        standard: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 },
        deluxe: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 },
        luxury: { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 }
      };
      
      const tierObj = { ...currentPricing[tier], [field]: val };
      
      const discount = tierObj.discount || 0;
      tierObj.priceAdult = Math.round(tierObj.originalPriceAdult * (1 - discount / 100));
      tierObj.priceChild = Math.round(tierObj.originalPriceChild * (1 - discount / 100));
      
      const nextPricing = { ...currentPricing, [tier]: tierObj };
      
      let extra = {};
      if (tier === "standard") {
        extra = {
          priceAdult: tierObj.priceAdult,
          priceChild: tierObj.priceChild,
          originalPrice: tierObj.originalPriceAdult,
          discount: tierObj.discount
        };
      }
      
      return {
        ...f,
        ...extra,
        categoryPricing: nextPricing
      };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      const setMap = {
        title: form.title,
        slug: form.slug,
        destination: form.destination,
        destinationName: form.destinationName,
        nights: String(form.nights),
        days: String(form.days),
        priceAdult: String(form.priceAdult),
        priceChild: String(form.priceChild),
        originalPrice: String(form.originalPrice),
        discount: String(form.discount),
        rating: String(form.rating),
        reviewCount: String(form.reviewCount),
        badge: form.badge,
        published: String(form.published),
        theme: JSON.stringify(form.theme),
        tags: JSON.stringify(form.tags.filter(Boolean)),
        description: form.description,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
        inclusions: JSON.stringify(form.inclusions.filter(Boolean)),
        exclusions: JSON.stringify(form.exclusions.filter(Boolean)),
        highlights: JSON.stringify(form.highlights.filter(Boolean)),
        itinerary: JSON.stringify(form.itinerary.filter((d) => d.title)),
        hotels: JSON.stringify(form.hotels.filter((h) => h.name)),
        transfers: JSON.stringify(form.transfers.filter((t) => t.title)),
        paymentPolicy: form.paymentPolicies && form.paymentPolicies.length > 0
          ? JSON.stringify(form.paymentPolicies)
          : "",
        categoryPricing: form.categoryPricing
          ? JSON.stringify(form.categoryPricing)
          : "",
        galleryUrls: JSON.stringify(existingGallery),
      };
      Object.entries(setMap).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append("coverImage", coverFile);
      else if (existingCover) fd.append("coverImage", existingCover);
      galleryFiles.forEach((f) => fd.append("gallery", f));

      if (isEdit) await api.adminUpdatePackage(id, fd);
      else await api.adminCreatePackage(fd);
      navigate("/admin/packages");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const importJSON = () => {
    const raw = window.prompt(
      "Paste a Product JSON (the schema used in the project brief):"
    );
    if (!raw) return;
    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      alert("That's not valid JSON.");
      return;
    }
    const region = j.Region || {};
    const next = {
      ...form,
      title: j["Product Name"] || form.title,
      slug: form.slug,
      description: j["Product Description"] || form.description,
      metaKeywords: j["Meta Keywords"] || form.metaKeywords,
      metaTitle: j["Meta Title"] || form.metaTitle,
      metaDescription: j["Meta Description"] || form.metaDescription,
      tags: Array.isArray(j.Tags) ? j.Tags : form.tags,
      priceAdult: typeof j["List Price"] === "number" ? j["List Price"] : form.priceAdult,
      highlights: Array.isArray(j.Highlights) ? j.Highlights : form.highlights,
      inclusions: typeof j.Inclusions === "string"
        ? Array.from(j.Inclusions.matchAll(/<li>(.*?)<\/li>/g), (m) => m[1].trim())
        : form.inclusions,
      exclusions: typeof j.exclusions === "string"
        ? Array.from(j.exclusions.matchAll(/<li>(.*?)<\/li>/g), (m) => m[1].trim())
        : form.exclusions,
      itinerary: Array.isArray(j.Itinerary)
        ? j.Itinerary.map((d) => ({
            day: d.Day,
            title: d.Title,
            description: d.Description,
            location: d.Location,
            meals: d.Meals,
            transferSharing: d["Transfer Sharing"],
            hotels: d.Hotels || [],
          }))
        : form.itinerary,
      hotels: Array.isArray(region.Hotels)
        ? region.Hotels.map((h) => ({
            id: h["Hotel ID"],
            name: h["Hotel Name"],
            address: h.Address,
            contactNumber: h["Contact Number"],
            contactEmail: h["Contact Email"],
            mapUrl: h["Google Map URL"],
            starCategory: h["Star Category"],
            propertyType: h["Property Type"],
          }))
        : form.hotels,
      transfers: Array.isArray(region.Transfers)
        ? region.Transfers.map((t) => ({
            id: t["Transfer ID"],
            title: t.Title,
            vehicle: t.Vehicle,
            occupancy: t.Occupency ?? t.Occupancy,
          }))
        : form.transfers,
      paymentPolicies: j["Payment Policy"]
        ? [
            {
              id: "pol-imported-" + Date.now(),
              name: j["Payment Policy"].Name || j["Payment Policy"].name || "",
              terms: j["Payment Policy"].terms || j["Payment Policy"].Terms || "",
            }
          ]
        : form.paymentPolicies || [],
    };
    setForm(next);
    alert(`Imported "${next.title}". Review the fields and save.`);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-navy)]">
            {isEdit ? "Edit package" : "New package"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload images locally — they'll be saved to <code>pinkfoot-api/uploads/</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={importJSON}
            className="rounded-full border border-[var(--color-pink)] px-4 py-2 text-xs font-bold text-[var(--color-pink)] hover:bg-[var(--color-pink)] hover:text-white"
          >
            📥 Import JSON
          </button>
          <Link to="/admin/packages" className="text-sm font-semibold text-gray-500 hover:text-[var(--color-pink)]">
            ← Cancel
          </Link>
        </div>
      </div>

      {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <Card title="Basics">
        <Grid>
          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  title: val,
                  slug: slugify(val),
                }));
              }}
              className="input"
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="auto from title"
              className="input"
            />
          </Field>
          <Field label="Destination" required>
            <select
              required
              value={form.destination}
              onChange={(e) => {
                const d = destinations.find((x) => x.slug === e.target.value);
                update("destination", e.target.value);
                if (d) update("destinationName", d.name);
              }}
              className="input"
            >
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.slug}>{d.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Badge">
            <select value={form.badge} onChange={(e) => update("badge", e.target.value)} className="input">
              {BADGES.map((b) => <option key={b} value={b}>{b || "— none —"}</option>)}
            </select>
          </Field>
        </Grid>

        <Field label="Themes" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => toggleTheme(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  form.theme.includes(t)
                    ? "border-[var(--color-pink)] bg-[var(--color-pink-pale)] text-[var(--color-pink)]"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      <Card title="Pricing & duration">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Nights"><input type="number" min="0" value={form.nights} onChange={(e) => update("nights", +e.target.value)} className="input" /></Field>
            <Field label="Days"><input type="number" min="1" value={form.days} onChange={(e) => update("days", +e.target.value)} className="input" /></Field>
            <Field label="Rating"><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => update("rating", +e.target.value)} className="input" /></Field>
            <Field label="Review count"><input type="number" min="0" value={form.reviewCount} onChange={(e) => update("reviewCount", +e.target.value)} className="input" /></Field>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Tier-Based Pricing</h3>
            <div className="space-y-4">
              {["standard", "deluxe", "luxury"].map((tier) => {
                const tierPrice = form.categoryPricing?.[tier] || { originalPriceAdult: 0, originalPriceChild: 0, discount: 0, priceAdult: 0, priceChild: 0 };
                return (
                  <div key={tier} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-navy)] block mb-3 capitalize">{tier} Category Pricing</span>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <Field label="Adult Original Price (₹)">
                        <input
                          type="number"
                          min="0"
                          value={tierPrice.originalPriceAdult || ""}
                          onChange={(e) => handleTierPriceChange(tier, "originalPriceAdult", +e.target.value)}
                          className="input"
                        />
                      </Field>
                      <Field label="Child Original Price (₹)">
                        <input
                          type="number"
                          min="0"
                          value={tierPrice.originalPriceChild || ""}
                          onChange={(e) => handleTierPriceChange(tier, "originalPriceChild", +e.target.value)}
                          className="input"
                        />
                      </Field>
                      <Field label="Discount (%)">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tierPrice.discount || ""}
                          onChange={(e) => handleTierPriceChange(tier, "discount", +e.target.value)}
                          className="input"
                        />
                      </Field>
                      <Field label="Calculated Adult Price (₹)">
                        <input
                          type="number"
                          readOnly
                          value={tierPrice.priceAdult || 0}
                          className="input bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                        />
                      </Field>
                      <Field label="Calculated Child Price (₹)">
                        <input
                          type="number"
                          readOnly
                          value={tierPrice.priceChild || 0}
                          className="input bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                        />
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Images">
        <Field label="Cover image">
          <ImageUpload
            existing={existingCover || null}
            files={coverFile ? [coverFile] : []}
            onFilesChange={(fs) => {
              setCoverFile(fs[0] || null);
              if (fs[0]) setExistingCover("");
            }}
            onRemoveExisting={() => setExistingCover("")}
          />
        </Field>
        <Field label="Gallery" className="mt-5">
          <ImageUpload
            multiple
            existing={existingGallery}
            files={galleryFiles}
            onFilesChange={setGalleryFiles}
            onRemoveExisting={(i) =>
              setExistingGallery((g) => g.filter((_, idx) => idx !== i))
            }
            helper="Drag in multiple images. JPG/PNG/WEBP up to 8 MB each."
          />
        </Field>
      </Card>

      <Card title="Long description">
        <Field label="Description">
          <RichTextEditor
            value={form.description}
            onChange={(val) => update("description", val)}
            placeholder="Embark on a magnificent journey…"
          />
          <div className="mt-1 text-[11px] text-gray-500">
            Renders above the tabs on the product page.
          </div>
        </Field>
        <ChipList
          label="Tags (free-form, beyond themes)"
          value={form.tags}
          onChange={(v) => update("tags", v)}
          placeholder="e.g., Multi-City, North India, Desert"
          className="mt-4"
        />
      </Card>

      <Card title="Content">
        <ChipList
          label="Inclusions"
          value={form.inclusions}
          onChange={(v) => update("inclusions", v)}
          placeholder="e.g., 5★ Hotel, Flights, Breakfast"
        />
        <ChipList
          label="Exclusions"
          value={form.exclusions}
          onChange={(v) => update("exclusions", v)}
          placeholder="e.g., Visa, Insurance"
          className="mt-4"
        />
        <ChipList
          label="Highlights"
          value={form.highlights}
          onChange={(v) => update("highlights", v)}
          placeholder="e.g., Sunset cruise"
          className="mt-4"
        />
      </Card>

      <Card title="Hotels (Where you'll stay)">
        <ol className="space-y-4">
          {form.hotels.map((h, i) => (
            <li key={i} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 text-xs text-gray-500">
                <span className="font-bold text-[var(--color-navy)]">Hotel {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update("hotels", form.hotels.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>

              <div className="mb-4 flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name={`hotel-source-${i}`}
                    checked={!h.isCustom}
                    onChange={() => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], isCustom: false, id: "", name: "", address: "", starCategory: 4, category: "standard", image: "", description: "" };
                      update("hotels", next);
                    }}
                    className="accent-[var(--color-pink)]"
                  />
                  Select from Stays
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name={`hotel-source-${i}`}
                    checked={!!h.isCustom}
                    onChange={() => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], isCustom: true, name: "", address: "", starCategory: 4, category: "standard", image: "", description: "", mapUrl: "", contactNumber: "", contactEmail: "", propertyType: "" };
                      update("hotels", next);
                    }}
                    className="accent-[var(--color-pink)]"
                  />
                  Create Custom Hotel
                </label>
              </div>

              {!h.isCustom ? (
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Select Stay
                  </label>
                  <select
                    value={h.id || ""}
                    onChange={(e) => {
                      const selectedStay = stays.find((s) => s.id === e.target.value);
                      if (selectedStay) {
                        const next = [...form.hotels];
                        next[i] = {
                          ...next[i],
                          id: selectedStay.id,
                          name: selectedStay.name,
                          propertyType: selectedStay.propertyType,
                          starCategory: selectedStay.starCategory,
                          category: selectedStay.tier || "standard",
                          address: selectedStay.address,
                          contactNumber: selectedStay.contactNumber,
                          contactEmail: selectedStay.contactEmail,
                          mapUrl: selectedStay.mapUrl,
                          image: selectedStay.image,
                          description: selectedStay.description,
                          isCustom: false,
                        };
                        update("hotels", next);
                      }
                    }}
                    className="input"
                  >
                    <option value="">— Choose a stay —</option>
                    {stays.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.propertyType || "Stay"})
                      </option>
                    ))}
                  </select>

                  {h.name && (
                    <div className="mt-3 flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      {h.image && (
                        <img src={h.image} className="h-16 w-24 flex-shrink-0 rounded-lg object-cover border border-gray-200" alt={h.name} />
                      )}
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{h.name}</div>
                        <div className="text-xs text-gray-500 font-medium capitalize mt-0.5">
                          {h.propertyType || "Hotel"} · <span className="text-[var(--color-pink)] font-bold">{h.category || "standard"}</span>
                        </div>
                        <div className="text-xs text-[var(--color-gold)] font-bold mt-1">{"★".repeat(h.starCategory)}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={h.name || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], name: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Hotel name"
                    className="input"
                  />
                  <input
                    value={h.propertyType || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], propertyType: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Property type (e.g., Heritage Hotel)"
                    className="input"
                  />
                  <input
                    value={h.address || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], address: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Address"
                    className="input sm:col-span-2"
                  />
                  <input
                    value={h.contactNumber || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], contactNumber: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Contact number"
                    className="input"
                  />
                  <input
                    value={h.contactEmail || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], contactEmail: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Contact email"
                    className="input"
                  />
                  <input
                    value={h.mapUrl || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], mapUrl: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Google Maps URL"
                    className="input sm:col-span-2"
                  />
                  <select
                    value={h.category || "standard"}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], category: e.target.value };
                      update("hotels", next);
                    }}
                    className="input"
                  >
                    <option value="standard">Standard Category</option>
                    <option value="deluxe">Deluxe Category</option>
                    <option value="luxury">Luxury Category</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={h.starCategory || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], starCategory: +e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Star (1-5)"
                    className="input"
                  />
                  <input
                    value={h.image || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], image: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Image URL (optional)"
                    className="input sm:col-span-2"
                  />
                  <textarea
                    rows={2}
                    value={h.description || ""}
                    onChange={(e) => {
                      const next = [...form.hotels];
                      next[i] = { ...next[i], description: e.target.value };
                      update("hotels", next);
                    }}
                    placeholder="Short description (optional)"
                    className="input sm:col-span-2"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => update("hotels", [...form.hotels, { name: "", propertyType: "", starCategory: 4, category: "standard", isCustom: false }])}
          className="mt-3 rounded-full border border-dashed border-[var(--color-pink)] px-4 py-2 text-xs font-bold text-[var(--color-pink)] cursor-pointer"
        >
          + Add hotel
        </button>
      </Card>

      <Card title="Transfers">
        <ol className="space-y-3">
          {form.transfers.map((t, i) => (
            <li key={i} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Transfer {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update("transfers", form.transfers.filter((_, idx) => idx !== i))}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <input
                  value={t.title || ""}
                  onChange={(e) => {
                    const next = [...form.transfers];
                    next[i] = { ...next[i], title: e.target.value };
                    update("transfers", next);
                  }}
                  placeholder="Title (e.g., Jaipur to Jodhpur)"
                  className="input sm:col-span-2"
                />
                <input
                  type="number"
                  min="1"
                  value={t.occupancy || ""}
                  onChange={(e) => {
                    const next = [...form.transfers];
                    next[i] = { ...next[i], occupancy: +e.target.value };
                    update("transfers", next);
                  }}
                  placeholder="Occupancy"
                  className="input"
                />
                <input
                  value={t.vehicle || ""}
                  onChange={(e) => {
                    const next = [...form.transfers];
                    next[i] = { ...next[i], vehicle: e.target.value };
                    update("transfers", next);
                  }}
                  placeholder="Vehicle (e.g., Toyota Innova Crysta)"
                  className="input sm:col-span-3"
                />
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => update("transfers", [...form.transfers, { title: "", vehicle: "", occupancy: 4 }])}
          className="mt-3 rounded-full border border-dashed border-[var(--color-pink)] px-4 py-2 text-xs font-bold text-[var(--color-pink)]"
        >
          + Add transfer
        </button>
      </Card>

      <Card title="Payment & Cancellation Policy">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Add policy" className="flex-1">
              <select
                onChange={(e) => {
                  const pid = e.target.value;
                  if (!pid) return;
                  const selected = availablePolicies.find(p => p.id === pid);
                  if (selected) {
                    if (form.paymentPolicies?.some(p => p.id === selected.id)) {
                      alert("This policy is already attached to this package.");
                      e.target.value = "";
                      return;
                    }
                    update("paymentPolicies", [...(form.paymentPolicies || []), selected]);
                  }
                  e.target.value = "";
                }}
                className="input"
              >
                <option value="">— Select policy to attach —</option>
                {availablePolicies.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {form.paymentPolicies && form.paymentPolicies.length > 0 ? (
            <div className="space-y-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Attached Policies
              </span>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/50 p-2">
                {form.paymentPolicies.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-start justify-between gap-4 p-3 first:pt-2 last:pb-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-[var(--color-navy)] block">{p.name}</span>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">{p.terms}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        update("paymentPolicies", form.paymentPolicies.filter((_, i) => i !== idx));
                      }}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No policies attached. Attach a policy above.</p>
          )}
        </div>
      </Card>

      <Card title="SEO meta">
        <Field label="Meta title">
          <input
            value={form.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
            placeholder="Royal Rajasthan Heritage Tour — 7N/8D | Pinkfoot"
            className="input"
          />
        </Field>
        <Field label="Meta description" className="mt-3">
          <textarea
            rows={2}
            value={form.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
            placeholder="One-paragraph snippet shown in Google search results."
            className="input"
          />
        </Field>
        <Field label="Meta keywords" className="mt-3">
          <input
            value={form.metaKeywords}
            onChange={(e) => update("metaKeywords", e.target.value)}
            placeholder="comma, separated, keywords"
            className="input"
          />
        </Field>
      </Card>

      <Card title="Itinerary">
        <ol className="space-y-4">
          {form.itinerary.map((d, i) => (
            <li key={i} className="rounded-xl border border-gray-200 p-4 bg-gray-50/30">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 text-xs text-gray-500">
                <span className="font-bold text-[var(--color-navy)]">Day {d.day}</span>
                <button
                  type="button"
                  onClick={() => update("itinerary", form.itinerary.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, day: idx + 1 })))}
                  className="text-red-500 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-3">
                <input
                  value={d.title}
                  onChange={(e) => {
                    const next = [...form.itinerary];
                    next[i] = { ...next[i], title: e.target.value };
                    update("itinerary", next);
                  }}
                  placeholder="Day title"
                  className="input"
                />
                <RichTextEditor
                  value={d.description}
                  onChange={(val) => {
                    const next = [...form.itinerary];
                    next[i] = { ...next[i], description: val };
                    update("itinerary", next);
                  }}
                  placeholder="Day description"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">Location</span>
                    <input
                      value={d.location || ""}
                      onChange={(e) => {
                        const next = [...form.itinerary];
                        next[i] = { ...next[i], location: e.target.value };
                        update("itinerary", next);
                      }}
                      placeholder="e.g., Jaipur, Rajasthan"
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">Meals</span>
                    <select
                      value={d.meals || ""}
                      onChange={(e) => {
                        const next = [...form.itinerary];
                        next[i] = { ...next[i], meals: e.target.value };
                        update("itinerary", next);
                      }}
                      className="input"
                    >
                      <option value="">— Select meal plan —</option>
                      <option value="B">Breakfast (B)</option>
                      <option value="CP">Continental Plan (CP)</option>
                      <option value="MAP">Breakfast + Dinner (MAP)</option>
                      <option value="AP">All Meals (AP)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">Transfer Sharing</span>
                    <input
                      value={d.transferSharing || ""}
                      onChange={(e) => {
                        const next = [...form.itinerary];
                        next[i] = { ...next[i], transferSharing: e.target.value };
                        update("itinerary", next);
                      }}
                      placeholder="e.g., Private, Sharing"
                      className="input"
                    />
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() =>
            update("itinerary", [
              ...form.itinerary,
              { day: form.itinerary.length + 1, title: "", description: "", location: "", meals: "", transferSharing: "", hotels: [] },
            ])
          }
          className="mt-4 rounded-full border border-dashed border-[var(--color-pink)] px-4 py-2 text-xs font-bold text-[var(--color-pink)] cursor-pointer"
        >
          + Add day
        </button>
      </Card>

      <Card title="Visibility">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="h-5 w-5 accent-[var(--color-pink)]"
          />
          Published (visible on public site)
        </label>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-heavy)]">
        <Link to="/admin/packages" className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">
          Cancel
        </Link>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create package"}
        </button>
      </div>

      <style>{`.input{width:100%;border-radius:.75rem;border:1px solid #d1d5db;background:#fff;padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--color-pink)}`}</style>
    </form>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 font-display text-lg font-bold text-[var(--color-navy)]">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
        {label} {required && <span className="text-[var(--color-pink)]">*</span>}
      </span>
      {children}
    </label>
  );
}

function ChipList({ label, value, onChange, placeholder, className = "" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...value, draft.trim()]);
    setDraft("");
  };
  return (
    <Field label={label} className={className}>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-pink-pale)] px-2.5 py-1 text-xs font-semibold text-[var(--color-pink)]"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-[var(--color-pink)]"
            >×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="input"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-[var(--color-navy)] px-4 py-2 text-xs font-bold text-white"
        >
          Add
        </button>
      </div>
    </Field>
  );
}
