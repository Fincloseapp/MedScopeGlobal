import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  Crown,
  ShieldCheck,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Tags,
} from "lucide-react";

export const ADMIN_NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/ingestion", label: "AI ingestion", icon: Bot },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
  { href: "/admin/vip", label: "VIP members", icon: Crown },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];
