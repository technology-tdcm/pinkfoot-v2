import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import ImageUpload from "../../components/ImageUpload.jsx";
import { Icon, Search, Bed, MapPin, Phone, Mail, Check, XCircle } from "../../components/icons/index.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

const PROPERTY_TYPES = [
  "Hotel",
  "Resort",
  "Villa",
  "Homestay",
  "Heritage Hotel",
  "Heritage Haveli",
  "Luxury Heritage Palace",
  "Standard Heritage Haveli",
  "Standard Lake View Haveli",
  "4★ Lake View Resort",
  "5★ Royal Heritage Palace",
  "5★ Luxury Heritage Palace",
  "Luxury Heritage Palace"
];

const TIERS = [
  { value: "", label: "— Uncategorized —" },
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "luxury", label: "Luxury" },
  { value: "premium", label: "Premium" },
];

const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY_STAY = {
  name: "",
  slug: "",
  propertyType: "",
  starCategory: 4,
  tier: "",
  destination: "",
  contactNumber: "",
  contactEmail: "",
  address: "",
  mapUrl: "",
  description: "",
};

export default function AdminStaysPage() {
  const [stays, setStays] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(EMPTY_STAY);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [coverFile, setCoverFile] = useState(null);
  const [existingCover, setExistingCover] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const s = await api.adminListStays();
      setStays(s);
      const d = await api.adminListDestinations();
      setDestinations(d);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (stay) => {
    setIsEdit(true);
    setEditId(stay.id);
    setForm({
      name: stay.name || "",
      slug: stay.slug || stay.id || "",
      propertyType: stay.propertyType || "",
      starCategory: stay.starCategory || 4,
      tier: stay.tier || "",
      destination: stay.destination || "",
      contactNumber: stay.contactNumber || "",
      contactEmail: stay.contactEmail || "",
      address: stay.address || "",
      mapUrl: stay.mapUrl || "",
      description: stay.description || "",
    });
    setExistingCover(stay.image || "");
    setCoverFile(null);
    setExistingGallery(stay.gallery || []);
    setGalleryFiles([]);
    setErr("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEdit(false);
    setEditId(null);
    setForm(EMPTY_STAY);
    setExistingCover("");
    setCoverFile(null);
    setExistingGallery([]);
    setGalleryFiles([]);
    setErr("");
    setSuccess("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setBusy(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      
      // Append cover
      if (coverFile) {
        fd.append("coverImage", coverFile);
      } else {
        fd.append("coverImage", existingCover);
      }

      // Append gallery
      fd.append("galleryUrls", JSON.stringify(existingGallery));
      galleryFiles.forEach((file) => {
        fd.append("gallery", file);
      });

      if (isEdit) {
        await api.adminUpdateStay(editId, fd);
        setSuccess("Stay details updated successfully.");
      } else {
        await api.adminCreateStay(fd);
        setSuccess("New stay created successfully.");
      }

      cancelEdit();
      loadData();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stay?")) return;
    setErr("");
    setSuccess("");
    try {
      await api.adminDeleteStay(id);
      setSuccess("Stay deleted successfully.");
      loadData();
    } catch (e) {
      setErr(e.message);
    }
  };

  const filtered = stays.filter((s) => {
    const q = search.toLowerCase();
    const destObj = destinations.find((d) => d.slug === s.destination);
    const destName = destObj ? destObj.name : "";
    return (
      s.name.toLowerCase().includes(q) ||
      s.propertyType.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q) ||
      destName.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  const getDestinationName = (slug) => {
    const d = destinations.find((x) => x.slug === slug);
    return d ? d.name : "—";
  };

  const getTierBadgeClass = (tier) => {
    switch (tier?.toLowerCase()) {
      case "standard":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      case "deluxe":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "luxury":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      case "premium":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-navy)]">
            Stays
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a stay once — hotels, homestays, villas — then attach it to any package without re-typing details.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stays..."
            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--color-pink)]"
          />
          <span className="absolute left-3.5 top-2.5 text-gray-400">
            <Icon size={12}><Search /></Icon>
          </span>
        </div>
      </div>

      {err && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{err}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {/* FORM CARD */}
      <section className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] border border-[var(--color-pink-pale)]/60">
        <h2 className="mb-5 font-display text-xl font-bold text-[var(--color-navy)]">
          {isEdit ? "Edit stay" : "Add a new stay"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Name <span className="text-[var(--color-pink)]">*</span>
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name: val,
                    slug: isEdit ? f.slug : slugify(val),
                  }));
                }}
                placeholder="e.g., Taj Bali Resort"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Slug (URL) <span className="text-[var(--color-pink)]">*</span>
              </span>
              <input
                required
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="e.g., taj-bali-resort"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Property Type
              </span>
              <select
                value={form.propertyType}
                onChange={(e) => updateField("propertyType", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)] cursor-pointer"
              >
                <option value="">— Select type —</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Star Category
              </span>
              <input
                type="number"
                min="1"
                max="5"
                value={form.starCategory}
                onChange={(e) => updateField("starCategory", parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Tier
              </span>
              <select
                value={form.tier}
                onChange={(e) => updateField("tier", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)] cursor-pointer"
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Destination
              </span>
              <select
                value={form.destination}
                onChange={(e) => updateField("destination", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)] cursor-pointer"
              >
                <option value="">— Any —</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Contact Number
              </span>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => updateField("contactNumber", e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Contact Email
              </span>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Address
              </span>
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Hotel address"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Google Maps URL
            </span>
            <input
              value={form.mapUrl}
              onChange={(e) => updateField("mapUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Cover Image
              </span>
              <ImageUpload
                existing={existingCover || null}
                files={coverFile ? [coverFile] : []}
                onFilesChange={(fs) => {
                  setCoverFile(fs[0] || null);
                  if (fs[0]) setExistingCover("");
                }}
                onRemoveExisting={() => setExistingCover("")}
                helper="JPG/PNG/WEBP, up to 8 MB."
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Gallery Images
              </span>
              <ImageUpload
                multiple
                existing={existingGallery}
                files={galleryFiles}
                onFilesChange={setGalleryFiles}
                onRemoveExisting={(idx) => setExistingGallery((prev) => prev.filter((_, i) => i !== idx))}
                helper="Drag & drop or click to upload multiple images."
              />
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Description
            </span>
            <RichTextEditor
              value={form.description}
              onChange={(val) => updateField("description", val)}
              placeholder="Short description of the property highlights, room tiers, views..."
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            {isEdit && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--color-pink)] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] disabled:opacity-60 transition cursor-pointer"
            >
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create stay"}
            </button>
          </div>
        </form>
      </section>

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5 text-center">★</th>
                <th className="px-6 py-3.5">Tier</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-xs font-medium">{s.propertyType || "Hotel"}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">{s.starCategory}★</td>
                    <td className="px-6 py-4">
                      {s.tier ? (
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${getTierBadgeClass(s.tier)}`}>
                          {s.tier}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{getDestinationName(s.destination)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs font-bold">
                        <button
                          onClick={() => startEdit(s)}
                          className="text-[var(--color-pink)] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No stays found. Add a stay above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
