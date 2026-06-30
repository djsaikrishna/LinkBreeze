"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Database, Download, Upload, Trash2, Save } from "lucide-react";
import {
  restoreBackup,
  clearAnalytics,
  setRetention,
} from "@/server/actions/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DataManager({ retentionDays }: { retentionDays: string }) {
  const router = useRouter();
  const [restorePending, setRestorePending] = React.useState(false);
  const [restoreMsg, setRestoreMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [clearPending, setClearPending] = React.useState(false);
  const [clearMsg, setClearMsg] = React.useState<string | null>(null);
  const [retention, setRetentionValue] = React.useState(retentionDays || "");
  const [retentionPending, startRetentionTransition] = React.useTransition();
  const [retentionSaved, setRetentionSaved] = React.useState(false);

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !window.confirm(
        "Restoring will REPLACE all current links, profile, settings and themes. Continue?",
      )
    ) {
      e.target.value = "";
      return;
    }
    setRestorePending(true);
    setRestoreMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await restoreBackup(fd);
      setRestoreMsg(
        res.success
          ? { ok: true, text: "Backup restored." }
          : { ok: false, text: res.error },
      );
      if (res.success) router.refresh();
    } catch {
      setRestoreMsg({ ok: false, text: "Restore failed." });
    } finally {
      setRestorePending(false);
      e.target.value = "";
    }
  };

  const handleClear = async () => {
    if (
      !window.confirm(
        "Permanently delete ALL analytics (views + clicks) and reset click counters?",
      )
    ) {
      return;
    }
    setClearPending(true);
    setClearMsg(null);
    try {
      const res = await clearAnalytics();
      setClearMsg(res.success ? "Analytics cleared." : res.error);
      if (res.success) router.refresh();
    } catch {
      setClearMsg("Failed to clear analytics.");
    } finally {
      setClearPending(false);
    }
  };

  const handleRetention = (formData: FormData) => {
    formData.set("retention", retention || "0");
    startRetentionTransition(async () => {
      await setRetention(formData);
      setRetentionSaved(true);
      setTimeout(() => setRetentionSaved(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5" />
          Data
        </CardTitle>
        <CardDescription>
          Back up or restore your content, and control analytics retention.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download endpoint (Content-Disposition: attachment); a plain anchor is correct, <Link/> is for page navigation */}
            <a
              href="/api/backup"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Download className="size-4" />
              Export backup
            </a>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <Upload className="size-4" />
              {restorePending ? "Restoring…" : "Restore backup"}
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleRestore}
                disabled={restorePending}
              />
            </label>
          </div>
          {restoreMsg ? (
            <p className={restoreMsg.ok ? "text-sm text-lavender" : "text-sm text-destructive"}>
              {restoreMsg.text}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={clearPending}
            className="w-fit text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            {clearPending ? "Clearing…" : "Clear all analytics"}
          </Button>
          {clearMsg ? (
            <p className={clearMsg.includes("cleared") ? "text-sm text-lavender" : "text-sm text-destructive"}>
              {clearMsg}
            </p>
          ) : null}
        </div>

        <form action={handleRetention} className="flex flex-col gap-2">
          <Label htmlFor="retention">Analytics retention (days)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="retention"
              type="number"
              min={0}
              value={retention}
              onChange={(e) => setRetentionValue(e.target.value)}
              placeholder="0 = keep forever"
              className="max-w-48"
            />
            <Button type="submit" variant="outline" disabled={retentionPending}>
              <Save className="size-4" />
              {retentionPending ? "Saving…" : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Older analytics are pruned automatically. 0 keeps everything.
          </p>
          {retentionSaved ? (
            <p className="text-sm text-lavender">Saved!</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
