"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/firebase/auth";
import { trackSignUp } from "@/components/analytics/GoogleAnalytics";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const COUNTRIES = [
  "United States", "Canada", "Mexico",
  "United Kingdom", "Germany", "France", "Australia",
  "Japan", "Singapore", "Other",
];

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().min(1, "Company name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string(),
    phone: z.string().min(7, "Valid phone number required"),
    country: z.string().min(1, "Country is required"),
    jobTitle: z.string().optional(),
    hearAboutUs: z.string().optional(),
    agreeTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
    marketingOptIn: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        phone: data.phone,
        country: data.country,
        jobTitle: data.jobTitle,
        marketingOptIn: data.marketingOptIn ?? false,
      });
      trackSignUp("email");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-sm border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Create Your Account</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Access Korea&apos;s precision manufacturing network
          </p>
        </div>

        {serverError && (
          <div className="mb-4 flex items-start gap-2 rounded-sm bg-red-50 border border-red-200 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">First Name *</label>
              <input
                {...register("firstName")}
                className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.firstName ? "border-red-400" : "border-[#E5E7EB]")}
              />
              {errors.firstName && <p className="mt-0.5 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Last Name *</label>
              <input
                {...register("lastName")}
                className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.lastName ? "border-red-400" : "border-[#E5E7EB]")}
              />
              {errors.lastName && <p className="mt-0.5 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Company Name *</label>
            <input
              {...register("company")}
              className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.company ? "border-red-400" : "border-[#E5E7EB]")}
            />
            {errors.company && <p className="mt-0.5 text-xs text-red-500">{errors.company.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Company Email *</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@yourcompany.com"
              className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.email ? "border-red-400" : "border-[#E5E7EB]")}
            />
            {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>}
            <p className="mt-0.5 text-xs text-[#6B7280]">Business email required (no Gmail/Hotmail)</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Password *</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPw ? "text" : "password"}
                className={cn("w-full rounded-sm border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.password ? "border-red-400" : "border-[#E5E7EB]")}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-[#6B7280]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-0.5 text-xs text-red-500">{errors.password.message}</p>}
            <p className="mt-0.5 text-xs text-[#6B7280]">Min 12 characters, uppercase + number required</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Confirm Password *</label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                className={cn("w-full rounded-sm border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.confirmPassword ? "border-red-400" : "border-[#E5E7EB]")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-[#6B7280]">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Phone *</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]", errors.phone ? "border-red-400" : "border-[#E5E7EB]")}
              />
              {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Country *</label>
              <select
                {...register("country")}
                className={cn("w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] bg-white", errors.country ? "border-red-400" : "border-[#E5E7EB]")}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.country && <p className="mt-0.5 text-xs text-red-500">{errors.country.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">Job Title <span className="text-[#6B7280]">(optional)</span></label>
            <input
              {...register("jobTitle")}
              placeholder="e.g. Mechanical Engineer, VP of Operations"
              className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A1A2E]">How did you hear about us? <span className="text-[#6B7280]">(optional)</span></label>
            <select
              {...register("hearAboutUs")}
              className="w-full rounded-sm border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] bg-white"
            >
              <option value="">Select...</option>
              <option value="linkedin">LinkedIn</option>
              <option value="google">Google Search</option>
              <option value="referral">Referral</option>
              <option value="trade_show">Trade Show</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] text-[#0066FF]"
              />
              <span className="text-xs text-[#6B7280]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#0066FF] underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#0066FF] underline">Privacy Policy</Link> *
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>}

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                {...register("marketingOptIn")}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] text-[#0066FF]"
              />
              <span className="text-xs text-[#6B7280]">
                I would like to receive product updates and manufacturing insights (optional)
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-[#0066FF] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6B7280]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#0066FF] hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
