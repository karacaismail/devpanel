import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { DynamicIsland } from "@/components/shell/DynamicIsland";
import { FloatingOrb } from "@/components/shell/FloatingOrb";
import { Engine } from "@/engine/Engine";
import { getPage, PAGE_LIST } from "@/engine/loader";

function PageRoute({ id }: { id?: string }) {
  const params = useParams();
  const pageId = id ?? params.pageId ?? "dashboard";
  const page = getPage(pageId);
  if (!page) {
    return (
      <div className="rounded-xl border border-border bg-panel p-8 text-center">
        <p className="text-lg">404</p>
        <p className="mt-1 text-sm text-muted">İçerik bulunamadı: content/pages/{pageId}.json yok.</p>
      </div>
    );
  }
  return <Engine page={page} />;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <Sidebar />
      <DynamicIsland />
      <TopBar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 lg:ml-64 lg:max-w-none lg:px-10">
        <Routes>
          <Route path="/" element={<PageRoute id="dashboard" />} />
          {PAGE_LIST.filter((p) => p.id !== "dashboard").map((p) => (
            <Route key={p.id} path={`/${p.id}`} element={<PageRoute id={p.id} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <FloatingOrb />
    </div>
  );
}
