"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { GROUPS } from "@/components/layout/sidebar";

/** K4 — Breadcrumb: grup → sayfa; segmentte kardeş kayıtlara geçiş dropdown'u. */
export function Breadcrumb() {
  const pathname = usePathname();
  const group = GROUPS.find((g) => g.items.some((i) => i.href === pathname));
  const page = group?.items.find((i) => i.href === pathname);
  if (!group || !page || pathname === "/") return null;

  return (
    <nav aria-label="breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
      <Link href="/" className="hover:text-neutral-300">MetaPanel</Link>
      <ChevronRight className="h-3 w-3 text-neutral-700" />
      <span>{group.label}</span>
      <ChevronRight className="h-3 w-3 text-neutral-700" />
      <details className="group relative">
        <summary className="cursor-pointer list-none text-neutral-200 hover:text-indigo-300">
          {page.label} <span className="text-neutral-600">▾</span>
        </summary>
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-neutral-800 bg-neutral-950 p-1 shadow-xl">
          {group.items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={
                i.href === pathname
                  ? "block rounded-md bg-indigo-600/10 px-2.5 py-1.5 text-indigo-300"
                  : "block rounded-md px-2.5 py-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }
            >
              {i.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
