import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { isValidRoomId } from "@/features/rooms/lib/room-id";
import { BroadcastStudio } from "@/features/streaming/components/broadcaster/broadcast-studio";

export const metadata: Metadata = {
  title: "Transmitir",
  robots: { index: false, follow: false },
};

export default function StreamRoomPage({
  params,
}: PageProps<"/stream/[id]">) {
  return (
    <>
      <SiteHeader className="border-b" />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
        <Suspense
          fallback={
            <div
              role="status"
              className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <LoaderCircle
                className="size-5 animate-spin text-primary"
                aria-hidden
              />
              Carregando sala…
            </div>
          }
        >
          <ResolvedBroadcastStudio params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function ResolvedBroadcastStudio({
  params,
}: Pick<PageProps<"/stream/[id]">, "params">) {
  const { id } = await params;
  if (!isValidRoomId(id)) notFound();
  return <BroadcastStudio roomId={id} />;
}
