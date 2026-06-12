"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { Palette, Copy, Download, RotateCcw, Wand2, Sun, Moon, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ColorToken {
  name: string;
  variable: string;
  value: string;
}

const initialColors: Record<string, ColorToken[]> = {
  Primary: [
    { name: "50", variable: "--primary-50", value: "#eef2ff" },
    { name: "100", variable: "--primary-100", value: "#e0e7ff" },
    { name: "200", variable: "--primary-200", value: "#c7d2fe" },
    { name: "300", variable: "--primary-300", value: "#a5b4fc" },
    { name: "400", variable: "--primary-400", value: "#818cf8" },
    { name: "500", variable: "--primary-500", value: "#6366f1" },
    { name: "600", variable: "--primary-600", value: "#4f46e5" },
    { name: "700", variable: "--primary-700", value: "#4338ca" },
    { name: "800", variable: "--primary-800", value: "#3730a3" },
    { name: "900", variable: "--primary-900", value: "#312e81" },
  ],
  Secondary: [
    { name: "50", variable: "--secondary-50", value: "#fdf4ff" },
    { name: "500", variable: "--secondary-500", value: "#d946ef" },
    { name: "600", variable: "--secondary-600", value: "#c026d3" },
    { name: "900", variable: "--secondary-900", value: "#701a75" },
  ],
  Semantic: [
    { name: "success", variable: "--color-success", value: "#10b981" },
    { name: "warning", variable: "--color-warning", value: "#f59e0b" },
    { name: "error", variable: "--color-error", value: "#ef4444" },
    { name: "info", variable: "--color-info", value: "#3b82f6" },
  ],
};

const typographyTokens = [
  { name: "Font Family (Sans)", variable: "--font-sans", value: "Inter, system-ui, sans-serif" },
  { name: "Font Family (Mono)", variable: "--font-mono", value: "JetBrains Mono, monospace" },
  { name: "Font Size (xs)", variable: "--text-xs", value: "0.75rem" },
  { name: "Font Size (sm)", variable: "--text-sm", value: "0.875rem" },
  { name: "Font Size (base)", variable: "--text-base", value: "1rem" },
  { name: "Font Size (lg)", variable: "--text-lg", value: "1.125rem" },
  { name: "Font Size (xl)", variable: "--text-xl", value: "1.25rem" },
  { name: "Font Size (2xl)", variable: "--text-2xl", value: "1.5rem" },
];

const spacingTokens = [
  { name: "Border Radius (sm)", variable: "--radius-sm", value: "0.25rem" },
  { name: "Border Radius (md)", variable: "--radius-md", value: "0.375rem" },
  { name: "Border Radius (lg)", variable: "--radius-lg", value: "0.5rem" },
  { name: "Border Radius (xl)", variable: "--radius-xl", value: "0.75rem" },
];

function generateCSSVars(colors: Record<string, ColorToken[]>): string {
  const lines = [":root {"];
  for (const [group, tokens] of Object.entries(colors)) {
    lines.push(`  /* ${group} */`);
    for (const token of tokens) {
      lines.push(`  ${token.variable}: ${token.value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function generateTailwindConfig(colors: Record<string, ColorToken[]>): string {
  const lines = [
    "// tailwind.config.ts",
    "export default {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
  ];
  for (const [group, tokens] of Object.entries(colors)) {
    if (group === "Semantic") {
      for (const t of tokens) {
        lines.push(`        "${t.name}": "${t.value}",`);
      }
    } else {
      lines.push(`        ${group.toLowerCase()}: {`);
      for (const t of tokens) {
        lines.push(`          "${t.name}": "${t.value}",`);
      }
      lines.push("        },");
    }
  }
  lines.push("      },", "    },", "  },", "};");
  return lines.join("\n");
}

export default function ThemePage() {
  const [colors, setColors] = useState(initialColors);
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing">("colors");
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind">("css");
  const [copied, setCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleColorChange = (group: string, index: number, value: string) => {
    setColors((prev) => ({
      ...prev,
      [group]: prev[group].map((t, i) => (i === index ? { ...t, value } : t)),
    }));
  };

  const handleCopy = () => {
    const output =
      exportFormat === "css" ? generateCSSVars(colors) : generateTailwindConfig(colors);
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Theme Engine</h1>
          <p className="text-sm text-neutral-400">Brand renkleri, tipografi ve spacing token&apos;larını yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setColors(initialColors)}>
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-3 w-3" /> : <Copy className="mr-2 h-3 w-3" />}
            {copied ? "Kopyalandı" : "Export"}
          </Button>
        </div>
      </div>

      {/* AI Color Generator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Wand2 className="hidden sm:block h-5 w-5 text-purple-400 shrink-0" />
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='AI: "Accessible palette oluştur..."'
              className="flex-1 border-purple-900/50 bg-purple-950/30"
            />
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto shrink-0">
              <Wand2 className="mr-2 h-3 w-3" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-800 p-1 w-fit">
        {(["colors", "typography", "spacing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-neutral-800 text-neutral-100"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab === "colors" ? "Colors" : tab === "typography" ? "Typography" : "Spacing"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Token Editor */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "colors" &&
            Object.entries(colors).map(([group, tokens]) => (
              <Card key={group}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{group}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {tokens.map((token, i) => (
                      <div key={token.variable} className="space-y-1.5">
                        <div
                          className="h-12 rounded-lg border border-neutral-700 cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: token.value }}
                        >
                          <input
                            type="color"
                            value={token.value}
                            onChange={(e) => handleColorChange(group, i, e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>
                        <p className="text-xs font-medium text-neutral-300">{token.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{token.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

          {activeTab === "typography" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Typography Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {typographyTokens.map((token) => (
                  <div key={token.variable} className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="sm:w-40">
                      <p className="text-sm font-medium text-neutral-200">{token.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{token.variable}</p>
                    </div>
                    <Input defaultValue={token.value} className="flex-1 font-mono text-xs" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "spacing" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Spacing & Border Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {spacingTokens.map((token) => (
                  <div key={token.variable} className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="sm:w-40">
                      <p className="text-sm font-medium text-neutral-200">{token.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{token.variable}</p>
                    </div>
                    <Input defaultValue={token.value} className="w-32 font-mono text-xs" />
                    <div
                      className="h-8 w-16 rounded border border-neutral-700 bg-indigo-600"
                      style={{ borderRadius: token.value }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview & Export */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-neutral-800 p-4 space-y-3" style={{ backgroundColor: colors.Primary[9]?.value || "#312e81" }}>
                <h3 className="text-lg font-bold" style={{ color: colors.Primary[0]?.value }}>
                  Sample Heading
                </h3>
                <p className="text-sm" style={{ color: colors.Primary[2]?.value }}>
                  Bu bir önizleme metnidir. Renk token&apos;larınız burada gösterilir.
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded-md px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: colors.Primary[5]?.value }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: colors.Primary[4]?.value,
                      color: colors.Primary[4]?.value,
                    }}
                  >
                    Outline
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {colors.Semantic.map((s) => (
                  <div
                    key={s.name}
                    className="flex-1 rounded-md p-2 text-center text-[10px] font-medium text-white"
                    style={{ backgroundColor: s.value }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Export</CardTitle>
                <div className="flex rounded-md border border-neutral-800 p-0.5">
                  <button
                    onClick={() => setExportFormat("css")}
                    className={`rounded px-2 py-1 text-[10px] font-medium ${
                      exportFormat === "css" ? "bg-neutral-800 text-white" : "text-neutral-500"
                    }`}
                  >
                    CSS Vars
                  </button>
                  <button
                    onClick={() => setExportFormat("tailwind")}
                    className={`rounded px-2 py-1 text-[10px] font-medium ${
                      exportFormat === "tailwind" ? "bg-neutral-800 text-white" : "text-neutral-500"
                    }`}
                  >
                    Tailwind
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-950 p-3 text-[11px] text-neutral-400 font-mono">
                {exportFormat === "css" ? generateCSSVars(colors) : generateTailwindConfig(colors)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <CliEquivalent tool="theme.read" args={{ app: "marketplace" }} />

    </div>
  );
}
