"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useNews} from "../NewsContext";
import {useToast} from "@/modules/core/ToastContext";
import {ApiError} from "@/services/apiClient";
import {Alert, Button, Card, Input, Select, Textarea} from "@fabiovisentainer/design-system";
import type {ArticleInput} from "../types";

interface Props {
  mode: "new" | "edit";
  articleId?: string;
  initial: ArticleInput;
}

type Errors = Partial<Record<"title" | "category" | "summary" | "body", string>>;

export function ArticleForm({ mode, articleId, initial }: Props) {
  const [form, setForm] = useState<ArticleInput>(initial);
  const [errors, setErrors] = useState<Errors>(
    mode === "new" ? { title: "A headline is required.", category: "Choose a category.", summary: "Write a short summary for the feed.", body: "The article body cannot be empty." } : {}
  );
  const { createArticle, updateArticle, saveDraft } = useNews();
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const errCount = Object.values(errors).filter(Boolean).length;

  const publish = async () => {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "A headline is required.";
    if (!form.category) e.category = "Choose a category.";
    if (!form.summary.trim()) e.summary = "Write a short summary for the feed.";
    if (!form.body.trim()) e.body = "The article body cannot be empty.";
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("Fill in every required field.", "err");
      return;
    }
    setSaving(true);
    try {
      if (mode === "edit" && articleId) await updateArticle(articleId, form);
      else await createArticle(form);
      showToast("Article published to the public feed.");
      router.push("/analyst");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors as Errors);
        showToast("Fill in every required field.", "err");
      } else {
        showToast("Could not publish this article. Please try again.", "err");
      }
    } finally {
      setSaving(false);
    }
  };

  const draft = async () => {
    setSaving(true);
    try {
      await saveDraft(articleId, form);
      showToast("Draft saved.");
      router.push("/analyst");
    } catch {
      showToast("Could not save the draft. Please try again.", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[820px] flex flex-col gap-4">
      {errCount > 0 && (
        <Alert title={`${errCount} required fields are empty.`}>Publishing is blocked until every required field is filled.</Alert>
      )}

      <Card padding="p-6" className="rounded-2xl flex flex-col gap-4.5">
        <Input
          label="Headline"
          required
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Copom holds Selic at 9.25% — what it means for equities"
          className="text-[15px] font-semibold"
          error={errors.title}
        />

        <div className="grid grid-cols-3 gap-3.5">
          <Select label="Category" required value={form.category} onChange={(e) => setField("category", e.target.value)} error={errors.category}>
            <option value="">Select…</option>
            <option value="Markets">Markets</option>
            <option value="Crypto">Crypto</option>
            <option value="Macro">Macro</option>
            <option value="Equities">Equities</option>
          </Select>
          <Input label="Related ticker" value={form.ticker} onChange={(e) => setField("ticker", e.target.value)} placeholder="Optional" mono />
          <Select label="Recommendation" value={form.rating} onChange={(e) => setField("rating", e.target.value)}>
            <option value="None">None</option>
            <option value="Buy">Buy</option>
            <option value="Hold">Hold</option>
            <option value="Sell">Sell</option>
          </Select>
        </div>

        <Textarea
          label="Summary"
          required
          value={form.summary}
          onChange={(e) => setField("summary", e.target.value)}
          rows={2}
          placeholder="Two lines that appear on the public feed."
          error={errors.summary}
        />

        <Textarea
          label="Body"
          required
          value={form.body}
          onChange={(e) => setField("body", e.target.value)}
          rows={8}
          placeholder="Full article…"
          error={errors.body}
          hint={<div className="text-xs text-[var(--color-text-faint)] text-right">{form.body.length} characters</div>}
        />

        <div className="flex gap-2.5 border-t border-[var(--color-border-3)] pt-4.5">
          <Button onClick={publish} disabled={saving}>
            {saving ? "Saving…" : "Publish"}
          </Button>
          <Button variant="secondary" onClick={draft} disabled={saving}>
            Save draft
          </Button>
          <Button variant="ghost" onClick={() => router.push("/analyst")}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
