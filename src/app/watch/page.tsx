import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { JoinRoomForm } from "@/features/rooms/components/join-room-form";

export const metadata: Metadata = {
  title: "Assistir transmissão",
};

export default function WatchIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md animate-in rounded-2xl border bg-surface p-6 duration-500 fade-in-0 slide-in-from-bottom-2 sm:p-8">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Eye className="size-5" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">
            Assistir transmissão
          </h1>
          <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
            Cole o link privado que você recebeu do anfitrião.
          </p>
          <JoinRoomForm />
        </div>
      </main>
    </>
  );
}
