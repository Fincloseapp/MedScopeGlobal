import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VipBadge() {
  return (
    <Badge variant="vip" className="gap-1">
      <Crown className="h-3 w-3" />
      VIP
    </Badge>
  );
}
