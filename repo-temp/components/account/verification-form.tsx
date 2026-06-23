"use client";

import { useState } from "react";
import { uploadVerificationDocument } from "@/lib/actions/verification";
import { PROFESSIONS } from "@/lib/config/access-levels";
import { clientT } from "@/lib/i18n/client-dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  profession: string | null;
  verificationStatus: string;
  documentUrl: string | null;
};

export function VerificationForm({
  profession,
  verificationStatus,
  documentUrl,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prof, setProf] = useState(profession ?? "physician");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set("profession", prof);
    const res = await uploadVerificationDocument(formData);
    setLoading(false);
    if (res.error) setMessage(res.error);
    else {
      setMessage(clientT("verification.step3Body"));
      window.location.reload();
    }
  }

  const statusKey =
    verificationStatus === "ai_review"
      ? "verification.status.aiReview"
      : `verification.status.${verificationStatus}`;

  return (
    <div className="space-y-4">
      <p className="text-sm">
        <span className="font-medium">{clientT("verification.step2Title")}:</span>{" "}
        {clientT(statusKey, verificationStatus)}
      </p>
      {documentUrl && (
        <p className="text-sm text-muted-foreground">
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {clientT("verification.step2Title")}
          </a>
        </p>
      )}
      {verificationStatus !== "approved" && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{clientT("verification.step1Title")}</Label>
            <Select value={prof} onValueChange={setProf}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {clientT(`verification.profession.${p}`, p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">{clientT("verification.step2Title")}</Label>
            <Input
              id="document"
              name="document"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              required={!documentUrl}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "…" : clientT("verification.step2Title")}
          </Button>
        </form>
      )}
      {message && (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
