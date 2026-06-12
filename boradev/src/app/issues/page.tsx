"use client";

import { useState } from "react";
import { Bug, Wand2, ThumbsUp, AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Issues: AI triage'lı iş takibi + hata gruplarından issue üretme. */

type Status = "open" | "triaged" | "in-progress" | "done";
type Severity = "low" | "medium" | "high" | "critical";

interface Issue {
  id: string;
  title: string;
  type: "bug" | "feature";
  status: Status;
  severity: Severity;
  assignee: string | null;
  votes: number;
  aiTriage?: string;
}

const SEED: Issue[] = [
  { id: "BUG-141", title: "PII maskesi CSV export'ta telefonun ilk 6 hanesini açık bırakıyor", type: "bug", status: "open", severity: "high", assignee: null, votes: 4 },
  { id: "BUG-139", title: "listing-flow v3 pinli tenant'ta migration q-7 uyarı vermiyor", type: "bug", status: "triaged", severity: "medium", assignee: "ismail", votes: 2, aiTriage: "İlgili: sus-versioning köprüsü. Önerilen şiddet: medium. Benzer kapanmış kayıt: BUG-112." },
  { id: "FTR-58", title: "Surface builder'da alan grubu (fieldset) desteği", type: "feature", status: "in-progress", severity: "low", assignee: "bora", votes: 11 },
  { id: "BUG-137", title: "Webhook imza doğrulaması saat farkında 500 dönüyor", type: "bug", status: "done", severity: "critical", assignee: "ali", votes: 7 },
];

const ERROR_GROUPS = [
  { id: "eg1", msg: "TypeError: cannot read 'edition' of undefined — forms/preview", count: 23, last: "12d önce" },
  { id: "eg2", msg: "GraphQL: parties(filter) timeout >5s — tenant globex", count: 6, last: "1s önce" },
];

const SEV_VARIANT: Record<Severity, "secondary" | "warning" | "destructive"> = {
  low: "secondary", medium: "warning", high: "destructive", critical: "destructive",
};
const STATUS_LABEL: Record<Status, string> = {
  open: "açık", triaged: "triage edildi", "in-progress": "çalışılıyor", done: "kapandı",
};

export default function IssuesPage() {
  const [issues, setIssues] = useState(SEED);
  let nextBug = 142;

  const aiTriage = (id: string) =>
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: i.status === "open" ? "triaged" : i.status,
              aiTriage: `AI triage: "${i.title.slice(0, 32)}…" → önerilen şiddet ${i.severity}, ilgili modül tespit edildi; benzer 2 kapalı kayıt bağlandı. (öneri ≠ karar)`,
            }
          : i,
      ),
    );

  const fromError = (msg: string) => {
    const id = `BUG-${nextBug++}`;
    setIssues((prev) => [
      { id, title: msg.split("—")[0].trim(), type: "bug", status: "open", severity: "medium", assignee: null, votes: 1 },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Bug className="h-6 w-6 text-indigo-400" /> Issues
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          AI triage önerir, geliştirici karar verir. Kapanmış işler change-set
          üzerinden release changelog&apos;una akar.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertOctagon className="h-4 w-4 text-red-400" /> Hata grupları → issue üret
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {ERROR_GROUPS.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-300">{e.msg}</code>
              <Badge variant="destructive">{e.count}×</Badge>
              <span className="text-xs text-neutral-500">{e.last}</span>
              <Button size="sm" variant="outline" onClick={() => fromError(e.msg)}>issue oluştur</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {issues.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-xs text-indigo-400">{i.id}</code>
                <span className="text-sm text-neutral-100">{i.title}</span>
                <Badge variant={i.type === "bug" ? "destructive" : "default"}>{i.type}</Badge>
                <Badge variant={SEV_VARIANT[i.severity]}>{i.severity}</Badge>
                <Badge variant="outline">{STATUS_LABEL[i.status]}</Badge>
                <span className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
                  {i.assignee ?? "atanmadı"}
                  <button
                    type="button"
                    onClick={() => setIssues((prev) => prev.map((x) => (x.id === i.id ? { ...x, votes: x.votes + 1 } : x)))}
                    className="flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 hover:text-neutral-200"
                  >
                    <ThumbsUp className="h-3 w-3" /> {i.votes}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => aiTriage(i.id)}>
                    <Wand2 className="mr-1 h-3 w-3" /> AI triage
                  </Button>
                </span>
              </div>
              {i.aiTriage && (
                <p className="mt-2 rounded-lg border border-indigo-500/20 bg-indigo-600/5 px-3 py-2 text-xs text-neutral-300">
                  {i.aiTriage}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CliEquivalent tool="issue.list" args={{ app: "marketplace" }} />
    </div>
  );
}
