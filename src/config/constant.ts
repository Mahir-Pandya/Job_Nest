import {
  LayoutDashboard,
  Search,
  Briefcase,
  Bookmark,
  Settings,
  Plus,
  User,
  Users,
  Building2,
  MessageSquare
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SESSION_LIFETIME = 30 * 24 * 60 * 60;
export const SESSION_REFRESH_TIME = SESSION_LIFETIME / 2;

export const SALARY_CURRENCY = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "NPR",
] as const;

export const SALARY_PERIOD = ["hourly", "monthly", "yearly"] as const;

export const JOB_TYPE = ["remote", "hybrid", "on-site"] as const;

export const WORK_TYPE = [
  "full-time",
  "part-time",
  "contract",
  "temporary",
  "freelance",
] as const;

export const JOB_LEVEL = [
  "internship",
  "entry level",
  "junior",
  "mid level",
  "senior level",
  "lead",
  "manager",
  "director",
  "executive",
] as const;

export const MIN_EDUCATION = [
  "none",
  "high school",
  "undergraduate",
  "masters",
  "phd",
] as const;

export const APPLICATION_STATUS = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
] as const;

// =====================================================
// NAVIGATION TYPES
// =====================================================
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number | "dynamic";
}

// =====================================================
// APPLICANT DASHBOARD NAVIGATION
// =====================================================
/**
 * Applicant Dashboard Navigation Items
 * Based on folder structure: app/(applicants)/dashboard/
 */
export const applicantNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true, // Exact match only for home
  },
  {
    name: "Find Jobs",
    href: "/jobs",
    icon: Search,
  },
  {
    name: "Applied",
    href: "/dashboard/applied-jobs",
    icon: Briefcase,
    badge: "dynamic", // Will show count of applied jobs
  },
  {
    name: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: Bookmark,
    badge: "dynamic", // Will show count of saved jobs
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// =====================================================
// EMPLOYER DASHBOARD NAVIGATION
// =====================================================
/**
 * Employer Dashboard Navigation Items
 * Based on folder structure: app/dashboard/
 */
// =====================================================
// EMPLOYER DASHBOARD NAVIGATION
// =====================================================
export const employerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Active Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    name: "Applications",
    href: "/dashboard/applications",
    icon: User,
  },
  {
    name: "Candidates",
    href: "/dashboard/candidates",
    icon: Users,
  },
  {
    name: "Company Profile",
    href: "/dashboard/company-profile",
    icon: Building2,
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// const navigationItems = [
//   { name: "Overview", icon: LayoutDashboard, href: base + "/" },
//   { name: "Applications", icon: User, href: base + "/applications" },
//   { name: "Post a Job", icon: Plus, href: base + "/jobs/create" },
//   { name: "My Jobs", icon: Briefcase, href: base + "/jobs" },
//   { name: "Settings", icon: Settings, href: base + "/settings" },
// ];
