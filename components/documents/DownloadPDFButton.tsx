"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/Button";
import { DocumentPDF } from "./DocumentPDF";
import type { DocumentFull, Settings } from "@/lib/types";

interface DownloadPDFButtonProps {
  document: DocumentFull;
  settings: Settings | null;
}

async function svgToPng(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 400;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(url); return; }
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export function DownloadPDFButton({ document: doc, settings }: DownloadPDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      let pdfSettings = settings;
      if (settings?.logo_url && /\.svg(\?|$)/i.test(settings.logo_url)) {
        const pngUrl = await svgToPng(settings.logo_url);
        pdfSettings = { ...settings, logo_url: pngUrl };
      }

      const blob = await pdf(
        <DocumentPDF document={doc} settings={pdfSettings} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${doc.document_number}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleDownload} disabled={generating}>
      {generating ? "PDF genereren..." : "Download PDF"}
    </Button>
  );
}
