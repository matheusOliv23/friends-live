import Link from "next/link";
import { Eye } from "lucide-react";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { buttonVariants } from "@/components/ui/button";
import { CreateRoomButton } from "@/features/rooms/components/create-room-button";
import { cn } from "@/lib/utils";

const ctaClassName = "h-11 gap-2 px-5 text-sm";

export function Hero() {
  return (
    <section className="relative isolate flex flex-col items-center overflow-hidden px-4 pt-16 pb-10 text-center sm:pt-24 sm:pb-16">
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute -top-24 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute top-40 left-[15%] -z-10 size-72 rounded-full bg-live/10 blur-3xl [animation-delay:2s]"
      />
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute top-28 right-[10%] -z-10 size-64 rounded-full bg-primary/15 blur-3xl [animation-delay:4s]"
      />

      {/* <span className="animate-rise stagger-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        <span className="relative flex size-1.5">
          <span className="animate-live-ring absolute inset-0 rounded-full bg-success" />
          <span className="relative size-1.5 rounded-full bg-success" />
        </span>
        Direto no navegador — nada para instalar
      </span> */}
{/* 
      <h1 className="animate-rise stagger-2 mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Compartilhe sua tela com amigos, em tempo real.
      </h1>

      <p className="animate-rise stagger-3 mt-4 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
        Transmita jogos e aplicativos por um link privado. Sem perfis, sem
        feed, sem distrações — só a sua tela.
      </p> */}

      <div className="animate-rise stagger-4 mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        <CreateRoomButton fullWidth className="sm:w-auto" />
        <Link
          href="/watch"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            ctaClassName,
            "w-full transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto",
          )}
        >
          <Eye data-icon="inline-start" />
          Assistir transmissão
        </Link>
      </div>

      <HeroShowcase />
    </section>
  );
}
