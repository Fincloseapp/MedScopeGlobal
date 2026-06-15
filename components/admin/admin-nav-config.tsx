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
} from "lucide-react";

export const ADMIN_NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/system", label: "Stav systému", icon: Activity },
  { href: "/admin/tests", label: "Testy", icon: FlaskConical },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/brand", label: "Brand & logo", icon: Palette },
  { href: "/admin/autopilot", label: "V6 Autopilot", icon: Bot },
  { href: "/admin/ingestion", label: "AI ingestion", icon: Bot },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/clk-verifications", label: "ČLK ověření", icon: IdCard },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/images", label: "Image Center", icon: ImageIcon },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
  { href: "/admin/ads-public", label: "Veřejné reklamy", icon: Megaphone },
  { href: "/admin/ads-students", label: "Studentské reklamy", icon: GraduationCap },
  { href: "/admin/marketing-hub", label: "Marketing hub", icon: BarChart3 },
  { href: "/admin/revenue", label: "Revenue v27", icon: TrendingUp },
  { href: "/admin/v27-pipeline", label: "Pipeline v27", icon: Bot },
  { href: "/admin/ads-overview", label: "Ads overview", icon: TrendingUp },
  { href: "/admin/verejnost", label: "Veřejnost", icon: Heart },
  { href: "/admin/vip", label: "VIP members", icon: Crown },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];
