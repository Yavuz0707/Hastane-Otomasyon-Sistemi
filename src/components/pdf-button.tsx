"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function PdfButton({ reportId, label = "PDF" }: { reportId: string; label?: string }) {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        const message = contentType.includes("application/json")
          ? (await response.json()).error
          : "PDF oluşturulamadı.";
        alert(message ?? "PDF oluşturulamadı.");
        return;
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        alert("Sunucu geçerli bir PDF dosyası döndürmedi.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `radyoloji-raporu-${reportId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      alert("PDF indirilirken beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn-pdf" type="button" onClick={downloadPdf} disabled={loading} aria-busy={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
      {loading ? "Hazırlanıyor" : label}
    </button>
  );
}
