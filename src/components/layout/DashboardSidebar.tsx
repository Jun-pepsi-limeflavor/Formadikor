"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Package,
  User,
  LogOut,
  Mail,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/lib/firebase/auth";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import { CopyEmailButton } from "@/components/analytics/GoogleAnalytics";

const ACCOUNT_MANAGER = {
  name: "Song Joon Ha",
  location: "Korea",
  email: SUPPORT_EMAIL,
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: PlusCircle, label: "New Quote", href: "/dashboard/quote/new" },
  { icon: FileText, label: "My Quotes", href: "/dashboard/quotes" },
  { icon: Package, label: "My Orders", href: "/dashboard/orders" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();
  const hasAssignedManager = Boolean(userProfile?.assignedManagerId);

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#E5E7EB] bg-white">
      <div className="flex h-16 items-center border-b border-[#E5E7EB] px-6">
        <BrandLogo href="/" size="sm" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#EEF4FF] text-[#0066FF]"
                      : "text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#1A1A2E]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E5E7EB] px-3 py-4">
        {hasAssignedManager ? (
          <div className="rounded-sm bg-[#F7F9FC] p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Your Account Manager
            </p>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066FF] text-white text-xs font-bold">
                {ACCOUNT_MANAGER.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">{ACCOUNT_MANAGER.name}</p>
                <p className="flex items-center gap-1 text-xs text-[#6B7280]">
                  <MapPin className="h-3 w-3" />
                  {ACCOUNT_MANAGER.location}
                </p>
              </div>
            </div>
            <CopyEmailButton
              location="dashboard_sidebar"
              className="flex w-full items-center justify-center gap-1 rounded-sm border border-[#E5E7EB] px-2 py-1.5 text-xs text-[#6B7280] hover:bg-white"
            >
              <Mail className="h-3 w-3" />
              {ACCOUNT_MANAGER.email}
            </CopyEmailButton>
          </div>
        ) : (
          <div className="rounded-sm bg-[#F7F9FC] p-3 text-xs text-[#6B7280]">
            <p className="font-medium text-[#1A1A2E] mb-1">Account Manager</p>
            <p>Being assigned — we&apos;ll notify you shortly.</p>
          </div>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
