import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import ImageUpload from "../../components/ImageUpload.jsx";
import ChipInput from "../../components/ChipInput.jsx";
import HighlightEditor, { normalizeHighlight } from "../../components/HighlightEditor.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

const EMPTY = {
  name: "", country: "", region: "", tagline: "", description: "",
  badge: "", startFrom: 0, rating: 4.5, reviewCount: 0,
  bestMonths: "", currency: "INR", themes: [], highlights: [], published: true,
  activity: "",
  regionType: "", regionKeywords: "",
  travelSeasonStart: "", travelSeasonEnd: "",
  salesSeasonStart: "", salesSeasonEnd: "",
};

const THEMES = ["Honeymoon", "Family", "Adventure", "Luxury", "Beach", "Culture", "Shopping"];

export default function AdminDestinationsPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [hero, setHero] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api.adminListDestinations().then(setItems);
  useEffect(() => { load(); }, []);

  const startEdit = (d) => {
    setEditing(d.id);
    setForm({
      name: d.name, country: d.country, region: d.region, tagline: d.tagline, description: d.description,
      badge: d.badge, startFrom: d.startFrom, rating: d.rating, reviewCount: d.reviewCount,
      bestMonths: d.bestMonths, currency: d.currency,
      themes: d.themes || [], highlights: d.highlights || [], published: d.published,
      activity: d.activity || "",
      regionType: d.regionType || "", regionKeywords: d.regionKeywords || "",
      travelSeasonStart: d.travelSeason?.start || "",
      travelSeasonEnd: d.travelSeason?.end || "",
      salesSeasonStart: d.salesSeason?.start || "",
      salesSeasonEnd: d.salesSeason?.end || "",
    });
    setHero(null);
  };
  const startNew = () => { setEditing("new"); setForm(EMPTY); setHero(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries({
        ...form,
        startFrom: String(form.startFrom),
        rating: String(form.rating),
        reviewCount: String(form.reviewCount),
        published: String(form.published),
        themes: JSON.stringify(form.themes),
        highlights: JSON.stringify(
          form.highlights
            .map(normalizeHighlight)
            .filter((h) => h.name && h.name.trim())
        ),
      }).forEach(([k, v]) => fd.append(k, v));
      if (hero) fd.append("heroImage", hero);

      if (editing === "new") await api.adminCreateDestination(fd);
      else await api.adminUpdateDestination(editing, fd);
      setEditing(null);
      load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete ${name} and ALL its packages?`)) return;
    await api.adminDeleteDestination(id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-navy)]">Destinations</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} destinations.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ New Destination</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
            <img src={d.heroImage} alt="" className="h-32 w-full object-cover" />
            <div className="p-4">
              <div className="font-display text-lg font-bold text-[var(--color-navy)]">{d.name}</div>
              <div className="text-xs text-gray-500">{d.country} · {d.region}</div>
              <div className="mt-2 text-xs text-gray-700">From ₹{d.startFrom?.toLocaleString("en-IN")}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(d)} className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold">Edit</button>
                <button onClick={() => remove(d.id, d.name)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-heavy)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
                {editing === "new" ? "New destination" : "Edit destination"}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="text-gray-400">✕</button>
            </div>
            {err && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
              <Input label="Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
              <Input label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
              <Input label="Best months" value={form.bestMonths} onChange={(v) => setForm({ ...form, bestMonths: v })} placeholder="Apr–Oct" />
              <Input label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
              <Input label="Starting price (₹)" type="number" value={form.startFrom} onChange={(v) => setForm({ ...form, startFrom: +v })} />
              <Input label="Rating" type="number" step="0.1" value={form.rating} onChange={(v) => setForm({ ...form, rating: +v })} />
              <Input label="Review count" type="number" value={form.reviewCount} onChange={(v) => setForm({ ...form, reviewCount: +v })} />
              <Input label="Badge" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="🔥 Trending" />
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">Description</span>
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
                placeholder="Describe the destination..."
              />
            </label>
            <div className="mt-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">Themes</span>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        themes: form.themes.includes(t)
                          ? form.themes.filter((x) => x !== t)
                          : [...form.themes, t],
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      form.themes.includes(t)
                        ? "border-[var(--color-pink)] bg-[var(--color-pink-pale)] text-[var(--color-pink)]"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Highlights — drives the "Top Experiences" cards
              </div>
              <HighlightEditor
                value={form.highlights}
                onChange={(v) => setForm({ ...form, highlights: v })}
              />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Activity — short blurb shown as “What you'll do”
              </span>
              <textarea
                value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                rows={2}
                placeholder="Cultural sightseeing, desert safari, heritage walks"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
              />
            </label>

            <div className="mt-3 rounded-xl border border-gray-100 bg-[var(--color-off-white)] p-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Travel & sales windows
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Travel season — start" value={form.travelSeasonStart} onChange={(v) => setForm({ ...form, travelSeasonStart: v })} placeholder="October 1" />
                <Input label="Travel season — end"   value={form.travelSeasonEnd}   onChange={(v) => setForm({ ...form, travelSeasonEnd: v })}   placeholder="March 31" />
                <Input label="Sales season — start"  value={form.salesSeasonStart}  onChange={(v) => setForm({ ...form, salesSeasonStart: v })}  placeholder="July 1" />
                <Input label="Sales season — end"    value={form.salesSeasonEnd}    onChange={(v) => setForm({ ...form, salesSeasonEnd: v })}    placeholder="September 30" />
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input label="Region type" value={form.regionType} onChange={(v) => setForm({ ...form, regionType: v })} placeholder="State / Country / City" />
              <Input label="Region keywords (SEO)" value={form.regionKeywords} onChange={(v) => setForm({ ...form, regionKeywords: v })} placeholder="comma, separated, keywords" />
            </div>
            <div className="mt-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Hero image
              </div>
              <ImageUpload
                existing={editing !== "new" && items.find((x) => x.id === editing)?.heroImage || null}
                files={hero ? [hero] : []}
                onFilesChange={(fs) => setHero(fs[0] || null)}
                onRemoveExisting={() => {/* hero will be replaced on submit if a new file is picked */}}
              />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-5 w-5 accent-[var(--color-pink)]" />
              Published
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", step, placeholder, required, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">{label}</span>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-pink)]"
      />
    </label>
  );
}
