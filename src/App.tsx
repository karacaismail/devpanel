import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BracketsCurly,
  Brain,
  Broadcast,
  Buildings,
  ChartBar,
  ChartLine,
  Clock,
  Image,
  TerminalWindow,
  UsersThree,
  ClockCounterClockwise,
  Database,
  EnvelopeSimple,
  GearSix,
  GraduationCap,
  FlowArrow,
  Graph,
  Heartbeat,
  House,
  PlugsConnected,
  ShareNetwork,
  Tag,
  ListChecks,
  PaintBrush,
  Plugs,
  PuzzlePiece,
  SquaresFour,
  StackSimple,
  TreeStructure,
  Warning,
} from "@phosphor-icons/react";
import { useUiStore, type ScreenId } from "./lib/store";
import { screenFromHash } from "./lib/navigation";
import { ARCHETYPES, SURFACES } from "./data/archetypes";
import { DLQ_ITEMS, MIGRATION_QUEUE, TEST_SUITES } from "./data/ops";
import { CommandPalette } from "./components/CommandPalette";
import { Overview } from "./screens/Overview";
import { ArchetypeStudio } from "./screens/ArchetypeStudio";
import { SurfaceBuilder } from "./screens/SurfaceBuilder";
import { WorkflowDesigner } from "./screens/WorkflowDesigner";
import { ModuleManager } from "./screens/ModuleManager";
import { DomainMap } from "./screens/DomainMap";
import { ApiExplorer } from "./screens/ApiExplorer";
import { DataBrowser } from "./screens/DataBrowser";
import { MigrationPanel } from "./screens/MigrationPanel";
import { TestRunner } from "./screens/TestRunner";
import { WbsBacklog } from "./screens/WbsBacklog";
import { Observability } from "./screens/Observability";
import { AuditLog } from "./screens/AuditLog";
import { AiConsole } from "./screens/AiConsole";
import { ThemeEditor } from "./screens/ThemeEditor";
import { Tenants } from "./screens/Tenants";
import { AppSettings } from "./screens/AppSettings";
import { Fragments } from "./screens/Fragments";
import { Releases } from "./screens/Releases";
import { EventCatalog } from "./screens/EventCatalog";
import { LearnPath } from "./screens/LearnPath";
import { Erd } from "./screens/Erd";
import { Scheduler } from "./screens/Scheduler";
import { Webhooks } from "./screens/Webhooks";
import { EmailTemplates } from "./screens/EmailTemplates";
import { Health } from "./screens/Health";
import { Media } from "./screens/Media";
import { Reports } from "./screens/Reports";
import { Terminal } from "./screens/Terminal";
import { Roles } from "./screens/Roles";
import { CodeEditor } from "./screens/CodeEditor";
import { TopBar } from "./components/TopBar";
import { Toasts } from "./components/Toasts";

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof House;
}

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "",
    items: [
      { id: "overview", label: "Genel Bakış", icon: House },
      { id: "learn", label: "Eğitim Yolu", icon: GraduationCap },
    ],
  },
  {
    title: "Tanım",
    items: [
      { id: "archetype", label: "ArcheType Studio", icon: TreeStructure },
      { id: "surface", label: "Surface Builder", icon: SquaresFour },
      { id: "fragments", label: "Fragment Kitaplığı", icon: PuzzlePiece },
      { id: "erd", label: "ERD — Şema Haritası", icon: ShareNetwork },
      { id: "workflow", label: "Workflow Designer", icon: FlowArrow },
      { id: "domains", label: "Domain & Contract", icon: Graph },
    ],
  },
  {
    title: "Veri",
    items: [
      { id: "data", label: "Data Browser", icon: Database },
      { id: "migration", label: "Migration Paneli", icon: StackSimple },
      { id: "api", label: "API Explorer", icon: Plugs },
      { id: "events", label: "Event Kataloğu", icon: Broadcast },
      { id: "webhooks", label: "Webhooks", icon: PlugsConnected },
      { id: "reports", label: "Reports", icon: ChartBar },
      { id: "media", label: "Media", icon: Image },
    ],
  },
  {
    title: "Kalite & İşletim",
    items: [
      { id: "tests", label: "Test Runner", icon: ListChecks },
      { id: "observability", label: "Observability", icon: ChartLine },
      { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
      { id: "scheduler", label: "Scheduler", icon: Clock },
      { id: "health", label: "Health", icon: Heartbeat },
      { id: "terminal", label: "Terminal", icon: TerminalWindow },
    ],
  },
  {
    title: "Genişletme",
    items: [
      { id: "modules", label: "Module Manager", icon: PuzzlePiece },
      { id: "ai", label: "AI Konsolu", icon: Brain },
      { id: "wbs", label: "WBS / Backlog", icon: ListChecks },
      { id: "theme", label: "Tema / Token", icon: PaintBrush },
      { id: "emails", label: "E-posta Şablonları", icon: EnvelopeSimple },
      { id: "code", label: "Code Editor", icon: BracketsCurly },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { id: "tenants", label: "Tenant Yönetimi", icon: Buildings },
      { id: "settings", label: "App Ayarları", icon: GearSix },
      { id: "releases", label: "Sürümler", icon: Tag },
      { id: "roles", label: "Roles", icon: UsersThree },
    ],
  },
];

const SCREENS: Record<ScreenId, () => ReactNode> = {
  overview: () => <Overview />,
  archetype: () => null, // veri ile aşağıda
  surface: () => null,
  workflow: () => <WorkflowDesigner />,
  modules: () => <ModuleManager />,
  domains: () => <DomainMap />,
  api: () => <ApiExplorer />,
  data: () => <DataBrowser />,
  migration: () => <MigrationPanel />,
  tests: () => <TestRunner />,
  wbs: () => <WbsBacklog />,
  observability: () => <Observability />,
  audit: () => <AuditLog />,
  ai: () => <AiConsole />,
  theme: () => <ThemeEditor />,
  tenants: () => <Tenants />,
  settings: () => <AppSettings />,
  fragments: () => <Fragments />,
  releases: () => <Releases />,
  events: () => <EventCatalog />,
  learn: () => <LearnPath />,
  erd: () => <Erd />,
  scheduler: () => <Scheduler />,
  webhooks: () => <Webhooks />,
  emails: () => <EmailTemplates />,
  health: () => <Health />,
  media: () => <Media />,
  reports: () => <Reports />,
  terminal: () => <Terminal />,
  roles: () => <Roles />,
  code: () => <CodeEditor />,
};

export default function App() {
  const { screen, setScreen, paletteOpen, setPaletteOpen } = useUiStore();

  /* Sunucu-durumu deseni (TanStack Query) — P0'da mock, üretimde kernel API. */
  const { data: archetypes = [] } = useQuery({
    queryKey: ["archetypes"],
    queryFn: async () => ARCHETYPES,
  });
  const { data: surfaces = [] } = useQuery({
    queryKey: ["surfaces"],
    queryFn: async () => SURFACES,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useUiStore.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen]);

  /* Deep-link: #ekran-id ↔ aktif ekran */
  useEffect(() => {
    const fromHash = screenFromHash(window.location.hash);
    if (fromHash) setScreen(fromHash);
    const onHash = () => {
      const s = screenFromHash(window.location.hash);
      if (s) setScreen(s);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setScreen]);

  useEffect(() => {
    if (window.location.hash !== `#${screen}`) {
      window.history.replaceState(null, "", `#${screen}`);
    }
  }, [screen]);

  const failedTests = TEST_SUITES.reduce((s, t) => s + t.failed, 0);
  const queued = MIGRATION_QUEUE.filter((m) => m.status === "kuyrukta").length;

  const body =
    screen === "archetype" ? (
      archetypes.length > 0 ? <ArchetypeStudio archetypes={archetypes} /> : null
    ) : screen === "surface" ? (
      surfaces.length > 0 ? <SurfaceBuilder surfaces={surfaces} /> : null
    ) : (
      SCREENS[screen]()
    );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-line bg-panel md:flex md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-ink">devpanel</span>
          <span className="rounded border border-line px-1.5 py-0.5 text-xs text-mute">
            enterprise
          </span>
        </div>

        {/* Tek panel, çok app (ilke #6) */}
        <div className="flex gap-2 px-4 pb-3">
          <select
            aria-label="App"
            className="w-1/2 rounded border border-line bg-elev px-1.5 py-1 text-xs text-ink"
          >
            <option>marketplace</option>
            <option>crm</option>
          </select>
          <select
            aria-label="Tenant"
            className="w-1/2 rounded border border-line bg-elev px-1.5 py-1 text-xs text-ink"
          >
            <option>acme</option>
            <option>globex</option>
          </select>
        </div>

        <nav className="flex overflow-auto px-2 pb-2 md:grow md:flex-col">
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="flex shrink-0 md:flex-col">
              {g.title && (
                <p className="hidden px-2 pb-1 pt-3 text-xs uppercase tracking-wide text-mute/60 md:block">
                  {g.title}
                </p>
              )}
              {g.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setScreen(id)}
                  aria-current={screen === id ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded px-2 py-1.5 text-sm ${
                    screen === id ? "bg-elev text-ink" : "text-mute hover:text-ink"
                  }`}
                >
                  <Icon size={16} className={screen === id ? "text-accent" : ""} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <p className="hidden px-4 pb-3 text-xs text-mute/50 md:block">
          AGPL · telemetri yok (ADR-0006)
        </p>
      </aside>

      <div className="flex min-w-0 grow flex-col">
        <TopBar />

        <main className="grow p-4">{body}</main>

        {/* Durum çubuğu — kernel iç durumu, tıklanınca ilgili panele gider */}
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-panel px-4 py-1.5 text-xs">
          <button
            type="button"
            onClick={() => setScreen("tests")}
            className={failedTests > 0 ? "flex items-center gap-1 text-danger" : "text-ok"}
          >
            {failedTests > 0 && <Warning size={13} />}
            conformance: {failedTests > 0 ? `${failedTests} kırmızı` : "✓"}
          </button>
          <button type="button" onClick={() => setScreen("migration")} className="text-mute hover:text-ink">
            migration kuyruğu: {queued}
          </button>
          <button type="button" onClick={() => setScreen("observability")} className="text-mute hover:text-ink">
            DLQ: {DLQ_ITEMS.length}
          </button>
          <span className="ml-auto text-mute/60">env: dev · şema 2026-06</span>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toasts />
    </div>
  );
}
