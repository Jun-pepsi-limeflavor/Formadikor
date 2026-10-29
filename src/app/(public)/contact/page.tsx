"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Clock, CheckCircle, AlertCircle, Upload, X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CopyEmailButton, trackContactSubmit } from "@/components/analytics/GoogleAnalytics";
import { SUPPORT_PHONE_US, SUPPORT_PHONE_US_TEL } from "@/lib/constants/support";
import { contactInquirySchema, type ContactInquiryInput } from "@/lib/schemas/contact";
import { submitContactInquiry, uploadContactFile } from "@/lib/api/client";
import { validateFile, formatFileSize } from "@/lib/utils/files";

interface PendingFile {
  file: File;
  fileName: string;
  fileSize: number;
  progress: number;
  error?: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInquiryInput>({ resolver: zodResolver(contactInquirySchema) });

  const handleFileDrop = useCallback((files: File[]) => {
    const next: PendingFile[] = files.map((f) => ({
      file: f,
      fileName: f.name,
      fileSize: f.size,
      progress: 0,
      error: validateFile(f) ?? undefined,
    }));
    setPendingFiles((prev) => [...prev, ...next]);
  }, []);

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContactInquiryInput) => {
    setSubmitError(null);
    try {
      const contactId = await submitContactInquiry(data);

      const validFiles = pendingFiles.filter((f) => !f.error);
      for (let i = 0; i < validFiles.length; i++) {
        const pf = validFiles[i];
        const globalIndex = pendingFiles.indexOf(pf);
        try {
          setPendingFiles((prev) =>
            prev.map((f, idx) => (idx === globalIndex ? { ...f, progress: 30 } : f))
          );
          await uploadContactFile(contactId, data.email, pf.file, (percent) => {
            setPendingFiles((prev) =>
              prev.map((f, idx) => (idx === globalIndex ? { ...f, progress: percent } : f))
            );
          });
          setPendingFiles((prev) =>
            prev.map((f, idx) => (idx === globalIndex ? { ...f, progress: 100 } : f))
          );
        } catch (err) {
          setPendingFiles((prev) =>
            prev.map((f, idx) =>
              idx === globalIndex
                ? { ...f, error: err instanceof Error ? err.message : "Upload failed" }
                : f
            )
          );
          throw err;
        }
      }

      trackContactSubmit();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-green-100 mb-4">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[#1A1A2E]">Message Sent.</h2>
        <p className="text-[#6B7280]">
          Your account manager will respond within 4 business hours.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-[#0A1628] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-3 text-4xl font-bold">Get In Touch</h1>
          <p className="text-lg text-gray-300">
            Typical response time: within 4 business hours. All conversations covered by NDA upon request.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-bold text-[#1A1A2E]">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#0066FF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">Email</p>
                      <CopyEmailButton
                        location="contact_page"
                        className="text-sm text-[#6B7280] hover:text-[#0066FF]"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#0066FF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">US Phone</p>
                      <a
                        href={`tel:${SUPPORT_PHONE_US_TEL}`}
                        className="text-lg font-semibold text-[#1A1A2E] hover:text-[#0066FF] tracking-wide"
                      >
                        {SUPPORT_PHONE_US}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#0066FF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">Response Time</p>
                      <p className="text-sm text-[#6B7280]">Within 4 business hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-[#0066FF]/20 bg-[#EEF4FF] p-5">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-[#0066FF] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold text-[#1A1A2E]">Create an account for easier project tracking</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      Sign up to upload drawings more easily, track sample shipments in one place,
                      and manage quotes, invoices, and other documents when you place real orders.
                    </p>
                    <Link
                      href="/signup"
                      className="mt-3 inline-block text-sm font-semibold text-[#0066FF] hover:underline"
                    >
                      Sign up →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-sm bg-[#F7F9FC] p-5">
                <h3 className="mb-3 font-semibold text-[#1A1A2E]">What Happens Next?</h3>
                <ol className="space-y-2 text-sm text-[#6B7280]">
                  <li className="flex gap-2">
                    <span className="font-bold text-[#0066FF]">1.</span>
                    Our team reviews your inquiry within 4 hours
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#0066FF]">2.</span>
                    A dedicated account manager is assigned to your project
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#0066FF]">3.</span>
                    We schedule a 30-min scoping call to understand your requirements
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#0066FF]">4.</span>
                    Quote delivered within 24 business hours of receiving files
                  </li>
                </ol>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-sm border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4"
              >
                {submitError && (
                  <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">First Name *</label>
                    <input
                      {...register("firstName")}
                      className={cn(
                        "w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]",
                        errors.firstName ? "border-red-400" : "border-[#E5E7EB]"
                      )}
                    />
                    {errors.firstName && (
                      <p className="mt-0.5 text-xs text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Last Name *</label>
                    <input
                      {...register("lastName")}
                      className={cn(
                        "w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]",
                        errors.lastName ? "border-red-400" : "border-[#E5E7EB]"
                      )}
                    />
                    {errors.lastName && (
                      <p className="mt-0.5 text-xs text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Company Email *</label>
                  <input
                    {...register("email")}
                    type="email"
                    className={cn(
                      "w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]",
                      errors.email ? "border-red-400" : "border-[#E5E7EB]"
                    )}
                  />
                  {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Company <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <input
                    {...register("company")}
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Phone <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Country / Region <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <input
                    {...register("country")}
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Manufacturing Process of Interest{" "}
                    <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <select
                    {...register("process")}
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="">Select process...</option>
                    <option>CNC Machining</option>
                    <option>Injection Molding</option>
                    <option>Sheet Metal Fabrication</option>
                    <option>Die Casting</option>
                    <option>Modular Construction Components</option>
                    <option>Electronics / PCB Assembly</option>
                    <option>Multiple / Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Estimated Annual Volume <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <select
                    {...register("volume")}
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="">Select volume...</option>
                    <option>Prototype only</option>
                    <option>Under $50K</option>
                    <option>$50K – $250K</option>
                    <option>$250K – $1M</option>
                    <option>$1M+</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    Project Description <span className="text-[#6B7280]">(optional, max 500 chars)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Brief description of your project, parts, or requirements..."
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#1A1A2E]">
                    Upload Files <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <div
                    className={cn(
                      "rounded-sm border-2 border-dashed p-6 text-center transition-colors",
                      dragging ? "border-[#0066FF] bg-[#EEF4FF]" : "border-[#E5E7EB] bg-[#F7F9FC]"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      handleFileDrop(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <Upload className="mx-auto mb-2 h-6 w-6 text-[#6B7280]" />
                    <p className="text-sm font-medium text-[#1A1A2E]">
                      Drop files here, or{" "}
                      <label className="cursor-pointer text-[#0066FF] hover:underline">
                        browse
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          accept=".step,.stp,.iges,.igs,.dxf,.dwg,.stl,.obj,.3mf,.pdf,.zip,.rar"
                          onChange={(e) =>
                            e.target.files && handleFileDrop(Array.from(e.target.files))
                          }
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      STEP · STP · IGES · DXF · DWG · STL · PDF · ZIP — Max 500 MB
                    </p>
                  </div>

                  {pendingFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {pendingFiles.map((pf, i) => (
                        <div
                          key={`${pf.fileName}-${i}`}
                          className="flex items-center gap-3 rounded-sm border border-[#E5E7EB] bg-white p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#1A1A2E]">{pf.fileName}</p>
                            <p className="text-xs text-[#6B7280]">{formatFileSize(pf.fileSize)}</p>
                            {pf.error && <p className="text-xs text-red-500">{pf.error}</p>}
                            {pf.progress > 0 && pf.progress < 100 && (
                              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                                <div
                                  className="h-full bg-[#0066FF]"
                                  style={{ width: `${pf.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="shrink-0 text-[#6B7280] hover:text-red-500"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">
                    How did you hear about us? <span className="text-[#6B7280]">(optional)</span>
                  </label>
                  <select
                    {...register("hearAboutUs")}
                    className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="">Select...</option>
                    <option>LinkedIn</option>
                    <option>Google Search</option>
                    <option>Referral</option>
                    <option>Trade Show</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-sm bg-[#0066FF] py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <p className="text-center text-xs text-[#6B7280]">
                  All conversations are covered by NDA upon request.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
