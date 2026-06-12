"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  desc: string;
  href: string;
  done: boolean;
}

const INITIAL: Step[] = [
  { id: "s1", title: "Granülerlik dilini öğren", desc: "Dağ → Çakıl cetveli; rozet biçimi: Ad (Metafor · SP). Seviye atlayan plan kaydedilemez.", href: "/wbs", done: true },
  { id: "s2", title: "İlk scaffold önizlemen", desc: "⌘K aç, doğal dil yaz — test dosyasının İLK üretildiğine dikkat et (test-önce).", href: "/ai-copilot", done: true },
  { id: "s3", title: "Şema bayraklarını incele", desc: "pii / bitemporal / retention / audit bayraklarının neler doğurduğuna bak.", href: "/schema", done: false },
  { id: "s4", title: "Form projeksiyonunu değiştir", desc: "Bir alanın görünürlüğünü kapat; değişikliğin tanım diff'i olarak gösterildiğini gör.", href: "/forms", done: false },
  { id: "s5", title: "Kırmızı testi oku", desc: "Test Runner'daki telafi eksiğini bul — kırmızı panel neden kapatılamaz?", href: "/test-runner", done: false },
  { id: "s6", title: "Agent yetkisini daralt", desc: "AI Copilot scope'unu küçült; blast-radius farkını gör.", href: "/ai-copilot", done: false },
];

export default function LearnPage() {
  const [steps, setSteps] = useState(INITIAL);
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <GraduationCap className="h-6 w-6 text-indigo-400" /> Eğitim Yolu
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Jr-öncesi vibecoder personası için panel turu — amaç AI&apos;ın ürettiğini{" "}
          <span className="text-neutral-200">anlayıp onaylayabilmek</span>.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <Badge variant="outline">%{pct}</Badge>
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => (
          <Card key={s.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <input
                type="checkbox"
                checked={s.done}
                onChange={() =>
                  setSteps((prev) => prev.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))
                }
                aria-label={`tamamlandı: ${s.title}`}
                className="mt-1 accent-indigo-500"
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", s.done ? "text-neutral-500 line-through" : "text-neutral-100")}>
                  <span className="mr-2 font-mono text-indigo-400">{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">{s.desc}</p>
              </div>
              <Link
                href={s.href}
                className="flex shrink-0 items-center gap-1 rounded-md border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-100"
              >
                ekranı aç <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <CliEquivalent tool="learn.status" args={{ user: "ismail" }} />
    </div>
  );
}
