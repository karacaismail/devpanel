import type { ReactNode } from "react";
import { Cube } from "@phosphor-icons/react";

/** Tutarlı boş-durum dili (bileşen envanteri §5). */
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line bg-panel p-8 text-center">
      <Cube size={28} className="text-mute" />
      <p className="text-ink">{title}</p>
      {children && <div className="text-sm text-mute">{children}</div>}
    </div>
  );
}
