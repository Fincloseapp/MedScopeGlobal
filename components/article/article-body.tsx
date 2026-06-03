import { Crown, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ArticleBody({
  html,
  locked,
}: {
  html: string;
  locked: boolean;
}) {
  if (locked) {
    return (
      <Card className="border-dashed bg-medical-light">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-900">
            <Lock className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-medical-navy">
              MedScope VIP
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This article is reserved for VIP subscribers. Upgrade for full
              access, an ad-free reading experience, and priority clinical
              alerts.
            </p>
          </div>
          <Button asChild>
            <Link href="/account">
              <Crown className="mr-2 h-4 w-4" />
              View membership options
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
