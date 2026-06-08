"use client";

import { useEffect, useState } from "react";

const WARNING_MS = 5 * 60 * 1000;

export function SessionWatcher() {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function check() {
      const raw = localStorage.getItem("sessionExpiry");
      if (!raw) return;
      const remaining = parseInt(raw) - Date.now();
      if (remaining <= 0) {
        window.location.href = "/login";
        return;
      }
      if (remaining <= WARNING_MS) {
        setMinutesLeft(Math.max(1, Math.ceil(remaining / 60000)));
      } else {
        setMinutesLeft(null);
        setDismissed(false);
      }
    }
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!minutesLeft || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-amber-50 p-4 shadow-premium ring-1 ring-amber-200 animate-fade-up">
      <p className="text-sm font-semibold text-amber-900">Oturum Sona Eriyor</p>
      <p className="mt-1 text-sm text-amber-700">
        Oturumunuz yaklaşık <strong>{minutesLeft} dakika</strong> içinde sona erecek.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
        >
          Oturumu Yenile
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-50 transition"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
