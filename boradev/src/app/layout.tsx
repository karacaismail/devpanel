import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DynamicIsland } from "@/components/layout/dynamic-island";
import { ContextualDock } from "@/components/layout/contextual-dock";
import { Sidebar } from "@/components/layout/sidebar";
import { GlobalContextBar } from "@/components/layout/global-context-bar";
import { InspectorRail } from "@/components/layout/inspector-rail";
import { DevDock } from "@/components/layout/dev-dock";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { CommandCenter } from "@/components/layout/command-center";
import { AiContextModal } from "@/components/layout/ai-context-modal";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { FloatingOrb } from "@/components/ai/floating-orb";
import { AISuggestions } from "@/components/ai/ai-suggestions";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaPanel - AI-First Developer Panel",
  description: "AI-native developer panel for building custom applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-neutral-950 text-neutral-100">
        <AmbientBackground />
        <DynamicIsland />
        <AISuggestions />
        <KeyboardShortcuts />
        <Sidebar />
        <GlobalContextBar />
        <ImpersonationBanner />
        <main className="relative z-10 mx-auto max-w-7xl px-3 pt-16 pb-32 sm:px-6 sm:pt-20 sm:pb-28 lg:ml-64 lg:max-w-none lg:px-10">
          <Breadcrumb />
          {children}
        </main>
        <InspectorRail />
        <DevDock />
        <CommandCenter />
        <AiContextModal />
        <ContextualDock />
        <FloatingOrb />
      </body>
    </html>
  );
}
