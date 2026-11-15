import Link from "next/link";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateRoomButton } from "@/features/rooms/components/create-room-button";
import { cn } from "@/lib/utils";

const ctaClassName = "h-11 gap-2 px-5 text-sm";

export function Hero() {
  return (
    <section className="relative isolate flex flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <span className="inline-flex animate-in items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs text-muted-foreground duration-500 fade-in-0">
        <span className="size-1.5 rounded-full bg-success" aria-hidden />
        Direto no navegador — nada para instalar
      </span>

      <h1 className="mt-6 max-w-2xl animate-in text-4xl font-semibold tracking-tight text-balance duration-700 fade-in-0 slide-in-from-bottom-2 sm:text-5xl">
        Compartilhe sua tela com amigos, em tempo real.
      </h1>

      <p className="mt-4 max-w-lg animate-in text-base text-pretty text-muted-foreground duration-700 fade-in-0 slide-in-from-bottom-2 sm:text-lg">
        Transmita jogos e aplicativos por um link privado. Sem perfis, sem
        feed, sem distrações — só a sua tela.
      </p>

      <div className="mt-8 flex w-full animate-in flex-col items-center justify-center gap-3 duration-700 fade-in-0 slide-in-from-bottom-3 sm:w-auto sm:flex-row">
        <CreateRoomButton fullWidth className="sm:w-auto" />
        <Link
          href="/watch"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            ctaClassName,
            "w-full sm:w-auto",
          )}
        >
          <Eye data-icon="inline-start" />
          Assistir transmissão
        </Link>
      </div>
    </section>
  );
}
