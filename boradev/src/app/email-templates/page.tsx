"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { Mail, Plus, Eye, Code, Wand2, Send, Copy, Check, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  event: string;
  lastEdited: string;
  status: "active" | "draft";
}

const templates: EmailTemplate[] = [
  { id: "1", name: "Hoş Geldiniz", subject: "{{app_name}}&apos;e hoş geldiniz!", event: "user.registered", lastEdited: "2 gün önce", status: "active" },
  { id: "2", name: "Şifre Sıfırlama", subject: "Şifrenizi sıfırlayın", event: "user.password_reset", lastEdited: "1 hafta önce", status: "active" },
  { id: "3", name: "Sipariş Onayı", subject: "Siparişiniz alındı #{{order_id}}", event: "order.created", lastEdited: "3 gün önce", status: "active" },
  { id: "4", name: "Kargo Bildirimi", subject: "Siparişiniz kargoya verildi", event: "order.shipped", lastEdited: "5 gün önce", status: "active" },
  { id: "5", name: "Haftalık Özet", subject: "Haftalık aktivite özetiniz", event: "scheduled.weekly_digest", lastEdited: "1 gün önce", status: "draft" },
  { id: "6", name: "İnaktif Kullanıcı", subject: "Sizi özledik!", event: "user.inactive_30d", lastEdited: "2 hafta önce", status: "draft" },
];

const previewHtml = `
<div style="max-width:600px;margin:0 auto;font-family:Inter,sans-serif;">
  <div style="background:#6366f1;padding:32px;text-center;border-radius:12px 12px 0 0;">
    <h1 style="color:white;margin:0;font-size:24px;">MetaPanel</h1>
  </div>
  <div style="padding:32px;background:#1f2937;color:#e5e7eb;">
    <h2 style="color:#f9fafb;margin:0 0 16px;">Hoş geldiniz, {{user_name}}!</h2>
    <p style="color:#9ca3af;line-height:1.6;">
      {{app_name}}'e kaydolduğunuz için teşekkürler. Hesabınız başarıyla oluşturuldu.
    </p>
    <a href="{{dashboard_url}}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">
      Dashboard'a Git
    </a>
    <p style="color:#6b7280;font-size:14px;">
      Herhangi bir sorunuz varsa bize <a href="mailto:{{support_email}}" style="color:#818cf8;">destek</a> üzerinden ulaşabilirsiniz.
    </p>
  </div>
  <div style="padding:16px 32px;background:#111827;border-radius:0 0 12px 12px;text-align:center;">
    <p style="color:#4b5563;font-size:12px;margin:0;">© 2026 {{app_name}}. Tüm hakları saklıdır.</p>
  </div>
</div>`;

const variables = ["{{user_name}}", "{{user_email}}", "{{app_name}}", "{{dashboard_url}}", "{{support_email}}", "{{order_id}}", "{{tracking_url}}"];

export default function EmailTemplatesPage() {
  const [active, setActive] = useState(templates[0]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-sm text-neutral-400">Bildirim ve transactional e-posta şablonları</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Wand2 className="mr-2 h-3 w-3" />AI Oluştur</Button>
          <Button size="sm" className="flex-1 sm:flex-none"><Plus className="mr-2 h-3 w-3" />Yeni Şablon</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Şablonlar</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                  active.id === t.id ? "bg-indigo-600/10 text-indigo-400" : "text-neutral-300 hover:bg-neutral-800"
                )}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{t.name}</p>
                  <p className="text-[10px] text-neutral-500">{t.event}</p>
                </div>
                <Badge variant={t.status === "active" ? "success" : "secondary"} className="text-[8px] shrink-0">{t.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{active.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{active.event}</Badge>
                    <span className="text-[10px] text-neutral-500">Son düzenleme: {active.lastEdited}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex rounded-lg border border-neutral-800 p-0.5">
                    <button onClick={() => setViewMode("preview")} className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium", viewMode === "preview" ? "bg-neutral-800 text-white" : "text-neutral-500")}>
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button onClick={() => setViewMode("code")} className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium", viewMode === "code" ? "bg-neutral-800 text-white" : "text-neutral-500")}>
                      <Code className="h-3 w-3" /> HTML
                    </button>
                  </div>
                  <Button variant="outline" size="sm"><Send className="mr-2 h-3 w-3" />Test Gönder</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <label className="mb-1 block text-[10px] text-neutral-500">Subject</label>
                <Input defaultValue={active.subject} className="font-mono text-xs" />
              </div>

              {viewMode === "preview" ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <pre className="max-h-[400px] overflow-auto rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-xs font-mono text-neutral-400">
                  {previewHtml}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* Variables */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kullanılabilir Değişkenler</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => { navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] font-mono text-indigo-400 hover:border-indigo-800 transition-colors"
                  >
                    {v}
                    <Copy className="h-2.5 w-2.5 text-neutral-600" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <CliEquivalent tool="template.list" args={{ app: "marketplace" }} />

    </div>
  );
}
