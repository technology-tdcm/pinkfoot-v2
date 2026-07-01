import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Icon, Search, Shield, Check, XCircle } from "../../components/icons/index.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";

const EMPTY_POLICY = {
  name: "",
  terms: "",
};

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(EMPTY_POLICY);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const p = await api.adminListPolicies();
      setPolicies(p);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (policy) => {
    setIsEdit(true);
    setEditId(policy.id);
    setForm({
      name: policy.name || "",
      terms: policy.terms || "",
    });
    setErr("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEdit(false);
    setEditId(null);
    setForm(EMPTY_POLICY);
    setErr("");
    setSuccess("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setBusy(true);

    try {
      if (isEdit) {
        await api.adminUpdatePolicy(editId, form);
        setSuccess("Policy updated successfully.");
      } else {
        await api.adminCreatePolicy(form);
        setSuccess("New policy created successfully.");
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
    if (!window.confirm("Are you sure you want to delete this policy? Any package using it will fall back to its remaining active policies.")) return;
    setErr("");
    setSuccess("");
    try {
      await api.adminDeletePolicy(id);
      setSuccess("Policy deleted successfully.");
      loadData();
    } catch (e) {
      setErr(e.message);
    }
  };

  const filtered = policies.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.terms.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-navy)]">
            Payment Policies
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create common payment and cancellation terms that can be added to package listings.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies..."
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
          {isEdit ? "Edit policy" : "Create a new policy"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Policy Name <span className="text-[var(--color-pink)]">*</span>
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Standard Installment Plan"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-[var(--color-pink)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Terms & Conditions <span className="text-[var(--color-pink)]">*</span>
            </span>
            <RichTextEditor
              value={form.terms}
              onChange={(val) => updateField("terms", val)}
              placeholder="e.g., 30% payment at the time of booking, free cancellation up to 30 days before departure..."
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
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create policy"}
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
                <th className="px-6 py-3.5 w-[250px]">Name</th>
                <th className="px-6 py-3.5">Terms & Conditions</th>
                <th className="px-6 py-3.5 text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-xs leading-relaxed text-gray-600 max-w-sm">
                      <div
                        className="line-clamp-3 prose prose-xs max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                        dangerouslySetInnerHTML={{ __html: p.terms || "" }}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs font-bold">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-[var(--color-pink)] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(p.id)}
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
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No policies found. Create a policy above!
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
