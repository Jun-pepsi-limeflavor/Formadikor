"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createQuote, updateQuote, submitQuote, uploadQuoteFile } from "@/lib/api/client";
import { trackQuoteSubmit } from "@/components/analytics/GoogleAnalytics";
import { validateFile, formatFileSize } from "@/lib/utils/files";
import { PROCESS_LABELS } from "@/types";
import type { ManufacturingProcess, QuoteConfiguration, QualityRequirements } from "@/types";
import { Upload, X, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { format, addBusinessDays } from "date-fns";

const STEPS = ["Select Process", "Upload Files", "Configure", "Review & Submit"];

const PROCESSES: { key: ManufacturingProcess; description: string; leadTime: string }[] = [
  { key: "cnc_machining", description: "Milling, turning, EDM, 5-axis machining", leadTime: "3–14 business days" },
  { key: "injection_molding", description: "Prototype & production tooling, overmolding", leadTime: "3–8 weeks" },
  { key: "sheet_metal", description: "Laser cutting, bending, stamping, welding", leadTime: "5–21 business days" },
  { key: "die_casting", description: "HPDC aluminum/zinc, investment casting", leadTime: "4–6 weeks" },
  { key: "construction", description: "Steel frames, facade panels, MEP pods", leadTime: "4–8 weeks" },
  { key: "electronics", description: "PCB fabrication, PCBA, box build", leadTime: "3–14 business days" },
];

const MATERIALS: Record<ManufacturingProcess, string[]> = {
  cnc_machining: ["Aluminum 6061", "Aluminum 7075", "Stainless Steel 304", "Stainless Steel 316", "Carbon Steel", "Titanium Grade 5", "Inconel 625", "Copper", "PEEK", "Delrin (POM)"],
  injection_molding: ["ABS", "PC (Polycarbonate)", "PP", "Nylon PA6", "Nylon PA66", "POM (Acetal)", "TPE", "TPU", "PEEK"],
  sheet_metal: ["SPCC (Cold Rolled Steel)", "SECC (Galvanized)", "SUS304 Stainless", "SUS316 Stainless", "Aluminum 5052", "Aluminum 6061", "Copper"],
  die_casting: ["A380 Aluminum", "ADC12 Aluminum", "Zamak #3 Zinc", "Zamak #5 Zinc"],
  construction: ["ASTM A36 Steel", "ASTM A572 Steel", "Aluminum 6061", "Aluminum 6063"],
  electronics: ["FR4 Standard", "FR4 High-Tg", "Rogers 4003C (RF)", "Polyimide (FPC)", "Halogen-Free"],
};

const FINISHES: Record<ManufacturingProcess, string[]> = {
  cnc_machining: ["As-Machined", "Anodize Type II", "Anodize Type III (Hard)", "Powder Coat", "Electropolish", "Nickel Plating", "Zinc Plating", "Bead Blast"],
  injection_molding: ["SPI A1 (Mirror)", "SPI A2", "SPI B1", "SPI C1", "SPI D1 (Rough)", "VDI 3400 Texture", "Custom Grain"],
  sheet_metal: ["As-Fabricated", "Powder Coat", "E-Coat", "Zinc Plating", "Chromate (Alodine)", "Anodize", "Brushed", "Bead Blast"],
  die_casting: ["As-Cast", "Shot Blast", "Powder Coat", "Anodize", "Chrome Plating", "E-Coat"],
  construction: ["Pre-Prime", "Powder Coat", "Galvanized", "Anodize (Aluminum)", "Paint-Ready"],
  electronics: ["HASL", "Lead-Free HASL", "ENIG", "ENEPIG", "OSP", "Immersion Silver"],
};

interface UploadedFile {
  file: File;
  fileName: string;
  driveFileId?: string;
  viewUrl?: string;
  progress: number;
  error?: string;
  fileSize: number;
}

interface ConfigState extends Omit<QuoteConfiguration, "targetDate"> {
  targetDate: string;
}

const defaultConfig = (process: ManufacturingProcess): ConfigState => ({
  partName: "",
  material: MATERIALS[process][0],
  finish: FINISHES[process][0],
  toleranceClass: "standard",
  quantity: 1,
  targetDate: format(addBusinessDays(new Date(), 14), "yyyy-MM-dd"),
  notes: "",
});

const defaultQuality: QualityRequirements = { fai: false, mtr: false, coc: false, ppap: false };

export default function NewQuotePage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcess | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [quality, setQuality] = useState<QualityRequirements>(defaultQuality);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleProcessSelect = (process: ManufacturingProcess) => {
    setSelectedProcess(process);
    setConfig(defaultConfig(process));
  };

  const handleFileDrop = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((f) => ({
      file: f,
      fileName: f.name,
      progress: 0,
      fileSize: f.size,
      error: validateFile(f) ?? undefined,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileDrop(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (qId: string): Promise<{ fileName: string; driveFileId: string; viewUrl: string; fileSize: number }[]> => {
    const results: { fileName: string; driveFileId: string; viewUrl: string; fileSize: number }[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const uf = uploadedFiles[i];
      if (uf.error) continue;
      try {
        setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 30 } : f)));
        const result = await uploadQuoteFile(qId, uf.file, (percent) => {
          setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: percent } : f)));
        });
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 100, driveFileId: result.driveFileId, viewUrl: result.viewUrl } : f
          )
        );
        results.push(result);
      } catch (err) {
        setUploadedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, error: err instanceof Error ? err.message : "Upload failed" } : f))
        );
      }
    }
    return results;
  };

  const handleSubmit = async () => {
    console.log("[handleSubmit] userProfile:", userProfile, "selectedProcess:", selectedProcess, "config:", config);
    if (!userProfile) { setError("Session error: user profile not loaded. Please refresh."); return; }
    if (!selectedProcess || !config) { setError("Please complete all steps before submitting."); return; }
    setSubmitting(true);
    setError(null);

    try {
      let qId = quoteId;
      if (!qId) {
        qId = await createQuote({ process: selectedProcess });
        setQuoteId(qId);
      }

      const fileResults = await uploadFiles(qId);

      await updateQuote(qId, {
        process: selectedProcess,
        files: fileResults.map((f) => ({
          fileName: f.fileName,
          driveFileId: f.driveFileId,
          viewUrl: f.viewUrl,
          fileSize: f.fileSize,
          uploadedAt: new Date(),
        })),
        configurations: [
          {
            ...config,
            targetDate: new Date(config.targetDate),
          },
        ],
        qualityRequirements: quality,
      });

      await submitQuote(qId);
      trackQuoteSubmit({ process: selectedProcess, file_count: fileResults.length });
      setSubmitted(true);
    } catch (err) {
      console.error("[handleSubmit] error:", err);
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && quoteId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg rounded-sm border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#1A1A2E]">Quote Submitted Successfully.</h1>
          <p className="mb-1 text-[#6B7280]">
            Your account manager will review your specifications and respond with a formal quote within{" "}
            <strong>24 business hours.</strong>
          </p>
          <p className="mb-6 text-sm text-[#6B7280]">
            You will receive a notification at <strong>{userProfile?.email}</strong> when your quote is ready.
          </p>
          <div className="mb-6 rounded-sm bg-[#F7F9FC] px-4 py-3">
            <p className="text-xs text-[#6B7280]">Quote Reference</p>
            <p className="spec-value text-lg font-bold tracking-widest text-[#1A1A2E]">
              Q-{quoteId.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/quotes")}
              className="flex-1 rounded-sm border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F7F9FC]"
            >
              View My Quotes
            </button>
            <button
              onClick={() => { setSubmitted(false); setStep(0); setSelectedProcess(null); setUploadedFiles([]); setConfig(null); setQuoteId(null); }}
              className="flex-1 rounded-sm bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Another Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-[#1A1A2E]">New Quote Request</h1>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm text-xs font-bold",
              i < step ? "bg-green-500 text-white" :
              i === step ? "bg-[#0066FF] text-white" :
              "bg-[#E5E7EB] text-[#6B7280]"
            )}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={cn("text-sm", i === step ? "font-medium text-[#1A1A2E]" : "text-[#6B7280]")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-[#E5E7EB]" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-sm bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Process Selection */}
      {step === 0 && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-[#1A1A2E]">Select Manufacturing Process</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROCESSES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleProcessSelect(p.key)}
                  className={cn(
                    "rounded-sm border p-5 text-left transition-all",
                    selectedProcess === p.key
                      ? "border-[#0066FF] bg-[#EEF4FF] shadow-sm"
                      : "border-[#E5E7EB] bg-white hover:border-[#0066FF]/30"
                  )}
                >
                  <h3 className="font-semibold text-[#1A1A2E]">{PROCESS_LABELS[p.key]}</h3>
                  <p className="mt-1 text-xs text-[#6B7280]">{p.description}</p>
                  <p className="mt-2 text-xs font-medium text-[#0066FF]">Lead time: {p.leadTime}</p>
                </button>
              ))}
            <button
              onClick={() => handleProcessSelect("cnc_machining")}
              className="rounded-sm border border-dashed border-[#E5E7EB] p-5 text-left hover:border-[#0066FF]/30 transition-all"
            >
              <h3 className="font-semibold text-[#1A1A2E]">Not Sure?</h3>
              <p className="mt-1 text-xs text-[#6B7280]">Let your account manager advise on the best process</p>
            </button>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!selectedProcess}
              className="rounded-sm bg-[#0066FF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Files */}
      {step === 1 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold text-[#1A1A2E]">Upload Files</h2>
          <p className="mb-6 text-sm text-[#6B7280]">Supported: STEP, STP, IGES, DXF, DWG, STL, PDF, ZIP — Max 500 MB each. All files encrypted at rest.</p>

          <div
            className={cn(
              "mb-4 rounded-sm border-2 border-dashed p-10 text-center transition-colors",
              dragging ? "border-[#0066FF] bg-[#EEF4FF]" : "border-[#E5E7EB] bg-[#F7F9FC]"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-3 h-8 w-8 text-[#6B7280]" />
            <p className="font-medium text-[#1A1A2E]">Drop your files here, or{" "}
              <label className="cursor-pointer text-[#0066FF] hover:underline">
                click to browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".step,.stp,.iges,.igs,.dxf,.dwg,.stl,.obj,.3mf,.pdf,.zip,.rar"
                  onChange={(e) => e.target.files && handleFileDrop(Array.from(e.target.files))}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">STEP · STP · IGES · DXF · DWG · STL · PDF · ZIP</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploadedFiles.map((uf, i) => (
                <div key={i} className="flex items-center gap-3 rounded-sm border border-[#E5E7EB] bg-white p-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A2E]">{uf.fileName}</p>
                    <p className="text-xs text-[#6B7280]">{formatFileSize(uf.fileSize)}</p>
                    {uf.error && <p className="text-xs text-red-500">{uf.error}</p>}
                    {uf.progress > 0 && uf.progress < 100 && (
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div className="h-full bg-[#0066FF]" style={{ width: `${uf.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeFile(i)} className="shrink-0 text-[#6B7280] hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <p className="mb-2 text-sm text-[#6B7280]">No CAD file yet? Describe your requirements:</p>
            <textarea
              rows={3}
              placeholder="Describe your part or assembly requirements..."
              className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              onChange={(e) => {
                if (config) setConfig({ ...config, notes: e.target.value });
              }}
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="rounded-sm border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F7F9FC]">← Back</button>
            <button onClick={() => setStep(2)} className="rounded-sm bg-[#0066FF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 2 && config && selectedProcess && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-[#1A1A2E]">Configure Your Part</h2>
          <div className="max-w-2xl space-y-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Part / Assembly Name *</label>
              <input
                value={config.partName}
                onChange={(e) => setConfig({ ...config, partName: e.target.value })}
                placeholder="e.g. Housing Cover v3, Bracket Assembly"
                className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Material *</label>
                <select
                  value={config.material}
                  onChange={(e) => setConfig({ ...config, material: e.target.value })}
                  className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                >
                  {MATERIALS[selectedProcess].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Surface Finish *</label>
                <select
                  value={config.finish}
                  onChange={(e) => setConfig({ ...config, finish: e.target.value })}
                  className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                >
                  {FINISHES[selectedProcess].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Tolerance Class</label>
                <select
                  value={config.toleranceClass}
                  onChange={(e) => setConfig({ ...config, toleranceClass: e.target.value as "standard" | "precision" | "custom" })}
                  className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                >
                  <option value="standard">Standard ±0.01mm</option>
                  <option value="precision">Precision ±0.005mm</option>
                  <option value="custom">Custom — specify below</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Quantity *</label>
                <input
                  type="number"
                  min={1}
                  value={config.quantity}
                  onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Target Delivery Date</label>
              <input
                type="date"
                value={config.targetDate}
                min={format(addBusinessDays(new Date(), 3), "yyyy-MM-dd")}
                onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
                className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Notes / Special Requirements</label>
              <textarea
                rows={3}
                value={config.notes}
                onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                placeholder="Thread callouts, surface finish specs, critical dimensions, reference standards..."
                className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>

            {/* Quality Requirements */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Quality Documentation (optional)</p>
              <div className="space-y-2">
                {(["fai", "mtr", "coc", "ppap"] as (keyof QualityRequirements)[]).map((key) => {
                  const labels: Record<keyof QualityRequirements, string> = {
                    fai: "First Article Inspection (FAI) Report",
                    mtr: "Material Test Report (MTR)",
                    coc: "Certificate of Conformance",
                    ppap: "PPAP Documentation",
                  };
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quality[key]}
                        onChange={(e) => setQuality({ ...quality, [key]: e.target.checked })}
                        className="h-4 w-4 rounded border-[#E5E7EB] text-[#0066FF]"
                      />
                      <span className="text-sm text-[#1A1A2E]">{labels[key]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-sm border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F7F9FC]">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!config.partName}
              className="rounded-sm bg-[#0066FF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Review & Submit →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 3 && config && selectedProcess && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-[#1A1A2E]">Review & Submit</h2>
          <div className="max-w-2xl space-y-4">
            <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
              <h3 className="mb-3 font-medium text-[#1A1A2E]">Quote Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Manufacturing Process</dt>
                  <dd className="font-medium">{PROCESS_LABELS[selectedProcess]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Part Name</dt>
                  <dd className="font-medium">{config.partName || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Material</dt>
                  <dd className="font-medium">{config.material}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Surface Finish</dt>
                  <dd className="font-medium">{config.finish}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Tolerance</dt>
                  <dd className="font-medium">{config.toleranceClass}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Quantity</dt>
                  <dd className="font-medium">{config.quantity} pcs</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Target Delivery</dt>
                  <dd className="font-medium">{config.targetDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Files Uploaded</dt>
                  <dd className="font-medium">{uploadedFiles.filter((f) => !f.error).length} file(s)</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
              <h3 className="mb-3 font-medium text-[#1A1A2E]">Contact Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Name</dt>
                  <dd className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Company</dt>
                  <dd className="font-medium">{userProfile?.company}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Email</dt>
                  <dd className="font-medium">{userProfile?.email}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-sm bg-[#EEF4FF] border border-blue-100 p-4 text-sm text-[#1A1A2E]">
              <p>
                By submitting, your account manager will review your specifications and respond with a fixed price quote and guaranteed lead time within{" "}
                <strong>24 business hours.</strong>
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-sm border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F7F9FC]">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-sm bg-[#0066FF] px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
