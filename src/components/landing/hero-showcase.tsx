import { StatusIndicator } from '@/components/status-indicator'

/** Preview visual da live — só atmosfera na landing, sem mídia real. */
export function HeroShowcase() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-3xl animate-rise stagger-5 px-1 sm:mt-16">
      <div
        aria-hidden
        className="animate-float-delayed absolute -top-6 -left-4 size-28 rounded-full bg-primary/25 blur-3xl motion-safe-only sm:-left-8"
      />
      <div
        aria-hidden
        className="animate-float absolute -right-2 -bottom-8 size-36 rounded-full bg-live/20 blur-3xl motion-safe-only sm:-right-6"
      />

      <div className="animate-float relative overflow-hidden rounded-2xl border border-primary/25 bg-surface shadow-[0_30px_80px_-40px_rgba(139,92,246,0.55)] motion-safe-only">
        <div
          aria-hidden
          className="animate-shimmer pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent"
        />

        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[#070709]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.28),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(239,68,68,0.16),transparent_50%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]"
          />
          <div
            aria-hidden
            className="animate-scan pointer-events-none absolute inset-x-0 h-1/3 bg-linear-to-b from-primary/25 via-primary/5 to-transparent"
          />

          <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
            <StatusIndicator label="Ao vivo" tone="live" pulse />
            {/* <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
              Sua tela aparece aqui para os amigos
            </p> */}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-linear-to-t from-black/80 to-transparent px-4 pt-12 pb-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="animate-live-ring absolute inset-0 rounded-full bg-live" />
                <span className="relative size-2.5 rounded-full bg-live" />
              </span>
              <span className="text-xs font-medium">Nexus Stream</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                · 1080p · 60 fps
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-8 rounded-full bg-white/20" />
              <span className="h-1.5 w-4 rounded-full bg-white/35" />
              <span className="size-6 rounded-md border border-white/15 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
