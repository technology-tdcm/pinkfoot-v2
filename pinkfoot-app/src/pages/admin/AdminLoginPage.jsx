import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import Logo from "../../components/Logo.jsx";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("info@pinkfoottravel.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="grid min-h-screen place-items-center px-6"
      style={{
        background: "linear-gradient(135deg, #1B2A4A 0%, #2D4272 50%, #3A1840 100%)",
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[var(--shadow-heavy)]"
      >
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold text-[var(--color-navy)]">
          Admin sign in
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Manage packages, destinations, and leads.
        </p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-pink)]"
            />
          </label>
        </div>

        {err && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          Default local creds: <code>info@pinkfoottravel.com</code> / <code>Admin@Pinkfoot123</code>
        </p>
      </form>
    </main>
  );
}
