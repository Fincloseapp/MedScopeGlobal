import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  Crown,
  Mail,
  Palette,
  ShieldCheck,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Tags,
  Activity,
  Heart,
  BarChart3,
  GraduationCap,
  TrendingUp,
  FlaskConical,
  IdCard,
  Wallet,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "rizeni",
    label: "Řízení",
    items: [
      { href: "/admin", label: "Přehled", icon: LayoutDashboard },
      { href: "/admin/system", label: "Stav systému", icon: Activity },
      { href: "/admin/tests", label: "Testy", icon: FlaskConical },
    ],
  },
  {
    id: "penize",
    label: "Peníze",
    items: [
      { href: "/admin/vydelky", label: "Výdělky", icon: Wallet },
      { href: "/admin/revenue", label: "Tržby v27", icon: TrendingUp },
      { href: "/admin/stripe-webhook-logs", label: "Stripe webhooky", icon: ShieldCheck },
      { href: "/admin/ads-overview", label: "Přehled reklam", icon: TrendingUp },
      { href: "/admin/v27-pipeline", label: "Pipeline v27", icon: Bot },
    ],
  },
  {
    id: "obsah",
    label: "Obsah",
    items: [
      { href: "/admin/articles", label: "Články", icon: Newspaper },
      { href: "/admin/categories", label: "Kategorie", icon: Tags },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/media", label: "Média", icon: ImageIcon },
      { href: "/admin/images", label: "Image Center", icon: ImageIcon },
      { href: "/admin/verejnost", label: "Veřejnost", icon: Heart },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { href: "/admin/ads", label: "Reklamy", icon: Megaphone },
      { href: "/admin/ads-public", label: "Veřejné reklamy", icon: Megaphone },
      { href: "/admin/ads-students", label: "Studentské reklamy", icon: GraduationCap },
      { href: "/admin/marketing-hub", label: "Marketing hub", icon: BarChart3 },
    ],
  },
  {
    id: "lide",
    label: "Lidé",
    items: [
      { href: "/admin/clk-verifications", label: "ČLK ověření", icon: IdCard },
      { href: "/admin/verification", label: "Verifikace", icon: ShieldCheck },
      { href: "/admin/vip", label: "VIP členové", icon: Crown },
      { href: "/admin/notifications", label: "Notifikace", icon: Bell },
    ],
  },
  {
    id: "system",
    label: "Systém",
    items: [
      { href: "/admin/brand", label: "Značka a logo", icon: Palette },
      { href: "/admin/autopilot", label: "Autopilot", icon: Bot },
      { href: "/admin/ingestion", label: "AI ingestion", icon: Bot },
      { href: "/admin/email-logs", label: "E-mailové logy", icon: Mail },
    ],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);
