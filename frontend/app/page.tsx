"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NdaForm from "@/components/NdaForm";
import NdaPreview from "@/components/NdaPreview";
import { defaultFormData, NdaFormData } from "@/lib/types";
import { generateNdaMarkdown, downloadPdf } from "@/lib/generateNda";
import { useAuth } from "@/lib/auth";

const PREVIEW_ID = "nda-pdf-preview";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);
  const [view, setView] = useState<"form" | "preview">("form");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/");
  }, [user, loading, router]);

  const markdown = generateNdaMarkdown(formData);

  const party1 = formData.party1Company || formData.party1Name || "Party1";
  const party2 = formData.party2Company || formData.party2Name || "Party2";
  const filename = `Mutual-NDA_${party1}_${party2}.pdf`
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  function handleDownload() {
    setDownloading(true);
    downloadPdf(PREVIEW_ID, filename);
    setTimeout(() => setDownloading(false), 1200);
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: "#209dd7" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#032147" }}>
              Mutual NDA Creator
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              Powered by{" "}
              <a
                href="https://commonpaper.com/standards/mutual-nda/1.0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "#209dd7" }}
              >
                Common Paper
              </a>{" "}
              · CC BY 4.0
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs" style={{ color: "#888888" }}>
              {user.email}
            </span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#209dd7" }}
            >
              {downloading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
              )}
              {downloading ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="lg:hidden border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setView("form")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              view === "form"
                ? "border-b-2 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={view === "form" ? { borderBottomColor: "#209dd7", color: "#209dd7" } : {}}
          >
            Form
          </button>
          <button
            onClick={() => setView("preview")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              view === "preview"
                ? "border-b-2"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={view === "preview" ? { borderBottomColor: "#209dd7", color: "#209dd7" } : {}}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-full">
          {/* Form panel */}
          <div
            className={`${
              view === "preview" ? "hidden" : "flex"
            } lg:flex flex-col w-full lg:w-[420px] flex-shrink-0`}
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-140px)] sticky top-6">
              <NdaForm data={formData} onChange={setFormData} />
            </div>
          </div>

          {/* Preview panel */}
          <div
            className={`${
              view === "form" ? "hidden" : "flex"
            } lg:flex flex-col flex-1 min-w-0`}
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 overflow-y-auto max-h-[calc(100vh-140px)] sticky top-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Document Preview
                </span>
                <span className="text-xs text-gray-400">{filename}</span>
              </div>
              <div id={PREVIEW_ID}>
                <NdaPreview markdown={markdown} formData={formData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
