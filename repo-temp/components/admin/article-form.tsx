"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveArticle } from "@/lib/actions/articles";
import { uploadMediaAsset } from "@/lib/storage/upload";
import type { Article, Category } from "@/types/database";

interface Props {
  categories: Category[];
  article?: Article | null;
}

export function ArticleForm({ categories, article }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "<p></p>");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(
    article?.cover_image_url ?? null
  );
  const [published, setPublished] = useState(article?.published ?? false);
  const [vipOnly, setVipOnly] = useState(article?.vip_only ?? false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const resolvedCategory = categoryId || categories[0]?.id;
      if (!resolvedCategory) {
        setMessage("Create a category before publishing articles.");
        setSaving(false);
        return;
      }
      await saveArticle({
        id: article?.id,
        title,
        slug: slug || undefined,
        excerpt,
        content,
        category_id: resolvedCategory,
        cover_image_url: coverUrl,
        published,
        vip_only: vipOnly,
      });
      router.push("/admin/articles");
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Unable to save article");
    } finally {
      setSaving(false);
    }
  }

  async function onCoverChange(file?: File | null) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const url = await uploadMediaAsset(fd);
    setCoverUrl(url);
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Auto-generated from title if empty"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={categoryId || categories[0]?.id || ""}
            onValueChange={(value) => setCategoryId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Cover image</Label>
        {coverUrl && (
          <p className="text-sm text-muted-foreground break-all">{coverUrl}</p>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => void onCoverChange(e.target.files?.[0])}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Published</p>
            <p className="text-sm text-muted-foreground">
              Makes the story visible to readers.
            </p>
          </div>
          <Switch checked={published} onCheckedChange={setPublished} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">VIP only</p>
            <p className="text-sm text-muted-foreground">
              Require an active MedScope VIP pass.
            </p>
          </div>
          <Switch checked={vipOnly} onCheckedChange={setVipOnly} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {message && <p className="text-sm text-destructive">{message}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save article"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/articles")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
