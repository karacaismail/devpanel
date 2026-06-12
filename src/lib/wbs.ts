import { checkNeighborhood, getLevel } from "./granularity";
import type { LevelId } from "./types";

/** P10 — WBS ağacı: gerçek tanımlardan türeyen SP kırılımı. */

export interface WbsNode {
  id: string;
  name: string;
  level: LevelId;
  children?: WbsNode[];
  done?: boolean;
}

export interface PlanViolation {
  nodeId: string;
  message: string;
}

/** Komşuluk kuralı ağaç genelinde: ihlalli plan KAYDEDİLEMEZ. */
export function validatePlan(root: WbsNode): PlanViolation[] {
  const out: PlanViolation[] = [];
  const walk = (node: WbsNode) => {
    for (const child of node.children ?? []) {
      const r = checkNeighborhood(getLevel(node.level), getLevel(child.level));
      if (!r.ok) out.push({ nodeId: child.id, message: r.message ?? "ihlal" });
      walk(child);
    }
  };
  walk(root);
  return out;
}

export function totalSp(node: WbsNode): number {
  return (
    getLevel(node.level).sp +
    (node.children ?? []).reduce((sum, c) => sum + totalSp(c), 0)
  );
}

export const WBS_TREE: WbsNode = {
  id: "root",
  name: "marketplace",
  level: "dag",
  children: [
    {
      id: "sales",
      name: "sales",
      level: "kaya",
      children: [
        {
          id: "listing",
          name: "listing",
          level: "buyuk-tas",
          done: true,
          children: [
            { id: "listing-surface", name: "listing-default surface", level: "orta-tas", done: true },
            { id: "listing-flow", name: "listing-flow workflow", level: "orta-tas" },
          ],
        },
        { id: "order", name: "order", level: "buyuk-tas" },
      ],
    },
    {
      id: "identity",
      name: "identity (kernel)",
      level: "kaya",
      children: [{ id: "party", name: "party", level: "buyuk-tas", done: true }],
    },
  ],
};
