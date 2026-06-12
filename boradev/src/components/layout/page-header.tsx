"use client";

import type { LucideIcon } from "lucide-react";
import { GitCommitHorizontal, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Lifecycle = "Draft" | "Staged" | "Released";

const LIFECYCLE_VARIANT: Record<Lifecycle, "secondary" | "warning" | "success"> = {
  Draft: "secondary",
  Staged: "warning",
  Released: "success",
};

/**
 * K7 — Canvas header standardı: başlık + owner chip + lifecycle + revizyon.
 * Her yeni sayfa bu bileşenle açılır (CLAUDE.md reçetesi).
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  owner = "ismail",
  lifecycle = "Draft",
  revision = "rev-2026.06.12-3",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  owner?: string;
  lifecycle?: Lifecycle;
  revision?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Icon className="h-6 w-6 text-indigo-400" /> {title}
        </h1>
        <span className="ml-auto flex items-center gap-1.5">
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" /> {owner}
          </Badge>
          <Badge variant={LIFECYCLE_VARIANT[lifecycle]}>{lifecycle}</Badge>
          <Badge variant="outline" className="gap-1 font-mono text-[10px]">
            <GitCommitHorizontal className="h-3 w-3" /> {revision}
          </Badge>
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>
    </div>
  );
}
