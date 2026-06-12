/**
 * Ambient arka plan — matematik defteri gridi (canlı kayan) + renk blob'ları.
 * Liquid-glass refraksiyonu DÜZ zeminde görünmez; bu grid kırılacak çizgileri
 * sağlar → cam yüzeylerin altında çizgiler bükülerek gerçek mercek hissi verir.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* renk blob'ları — gridi renklendirip kırılmayı belirginleştirir */}
      <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
      {/* matematik-defteri gridi — ince + kalın çizgiler, yavaş kayan */}
      <div className="lg-grid lg-grid-minor absolute inset-[-10%]" />
      <div className="lg-grid lg-grid-major absolute inset-[-10%]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.10),transparent_60%)]" />
    </div>
  );
}
