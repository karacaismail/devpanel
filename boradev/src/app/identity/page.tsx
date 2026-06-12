"use client";

import { useState } from "react";
import { Fingerprint, MonitorSmartphone, KeySquare, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

type Tab = "oauth" | "idp" | "sessions";

const OAUTH = [
  { id: "erp-bridge", type: "confidential", redirect: "https://erp.acme.example/cb", scopes: ["party.read", "order.read"] },
  { id: "mobile-app", type: "public (PKCE)", redirect: "app://callback", scopes: ["profile"] },
];

const IDPS = [
  { id: "acme-azuread", kind: "OIDC", users: 41, status: "aktif" },
  { id: "globex-okta", kind: "SAML", users: 12, status: "aktif" },
  { id: "legacy-ldap", kind: "LDAP federation", users: 7, status: "salt-okunur" },
];

const SESSIONS = [
  { who: "ismail", device: "MacBook · Safari", ip: "78.x.x.x", started: "09:12", mfa: true },
  { who: "bora", device: "Linux · Firefox", ip: "10.0.2.41", started: "08:55", mfa: true },
  { who: "vibebot (agent)", device: "MCP oturumu", ip: "internal", started: "11:42", mfa: false },
];

export default function IdentityPage() {
  const [tab, setTab] = useState<Tab>("idp");
  const [revoked, setRevoked] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Fingerprint}
        title="Kimlik & Oturumlar"
        description="OAuth istemcileri, kimlik sağlayıcılar (OIDC/SAML/LDAP) ve canlı oturumlar — MFA politikası org genelinde zorunludur."
        lifecycle="Staged"
      />

      <div className="flex gap-1">
        {(
          [
            ["idp", "Kimlik Sağlayıcılar", Network],
            ["oauth", "OAuth İstemcileri", KeySquare],
            ["sessions", "Oturumlar", MonitorSmartphone],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
              tab === id ? "bg-indigo-600/15 text-indigo-300" : "text-neutral-400 hover:bg-neutral-800"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "idp" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sağlayıcılar</CardTitle>
            <CardDescription>Identity brokering: tenant kullanıcıları kendi IdP&apos;siyle girer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {IDPS.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-neutral-100">{i.id}</code>
                <Badge variant="outline">{i.kind}</Badge>
                <span className="text-xs text-neutral-500">{i.users} kullanıcı</span>
                <Badge variant={i.status === "aktif" ? "success" : "secondary"} className="ml-auto">{i.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "oauth" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">İstemciler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {OAUTH.map((c) => (
              <div key={c.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-xs text-neutral-100">{c.id}</code>
                  <Badge variant={c.type.startsWith("conf") ? "default" : "secondary"}>{c.type}</Badge>
                  {c.scopes.map((s) => (
                    <Badge key={s} variant="outline" className="font-mono">{s}</Badge>
                  ))}
                </div>
                <p className="mt-1 font-mono text-[11px] text-neutral-500">redirect: {c.redirect}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "sessions" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Canlı oturumlar</CardTitle>
            <CardDescription>Sonlandırma audit&apos;e yazılır; agent oturumları scope&apos;la sınırlıdır.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {SESSIONS.map((s) => (
              <div key={s.who + s.started} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <span className="text-neutral-100">{s.who}</span>
                <span className="text-xs text-neutral-500">{s.device} · {s.ip} · {s.started}</span>
                <Badge variant={s.mfa ? "success" : "warning"}>{s.mfa ? "MFA" : "MFA yok"}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={revoked.includes(s.who)}
                  onClick={() => setRevoked((p) => [...p, s.who])}
                  className="ml-auto text-red-400"
                >
                  {revoked.includes(s.who) ? "sonlandırıldı" : "sonlandır"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <CliEquivalent tool="identity.providers" args={{ org: "acme" }} />
    </div>
  );
}
