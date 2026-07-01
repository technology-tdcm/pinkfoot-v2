import { useEffect } from "react";
import { Icon, XCircle, Shield, Wallet } from "./icons/index.jsx";

export default function PolicyModal({ policies, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-[var(--color-navy)]">
            <Icon size={18}><Wallet /></Icon>
            <h2 className="font-display text-lg font-bold">Payment & Cancellation Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <Icon size={22}><XCircle /></Icon>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {policies.map((policy, idx) => (
            <div key={policy.id || idx} className={idx > 0 ? "border-t border-gray-100 pt-6" : ""}>
              {policy.name && (
                <div className="mb-3 inline-block rounded-full bg-[var(--color-navy)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  {policy.name}
                </div>
              )}
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-1.5 [&_p:first-child]:mt-0 [&_li]:mt-0.5 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: policy.terms || "" }}
              />
            </div>
          ))}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-700">
              <Icon size={16}><Shield /></Icon> No booking fee
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-700">
              <Icon size={16}><Wallet /></Icon> Secure payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
