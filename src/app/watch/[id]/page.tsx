import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { isValidRoomId } from "@/features/rooms/lib/room-id";
import { PlayerFrame } from "@/features/streaming/components/viewer/player-frame";
import { PlayerLoading } from "@/features/streaming/components/viewer/player-state-overlay";
import { ViewerRoom } from "@/features/streaming/components/viewer/viewer-room";
import { SITE_NAME } from "@/lib/site";

const WATCH_TITLE = "Convite para assistir";
const WATCH_DESCRIPTION =
  "Seu amigo compartilhou a tela com você. Abra o link para assistir ao vivo.";

export const metadata: Metadata = {
  title: WATCH_TITLE,
  description: WATCH_DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: `${WATCH_TITLE} · ${SITE_NAME}`,
    description: WATCH_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${WATCH_TITLE} · ${SITE_NAME}`,
    description: WATCH_DESCRIPTION,
  },
};

export default function WatchRoomPage({ params }: PageProps<"/watch/[id]">) {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <main className="min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
        <Suspense
          fallback={
            <PlayerFrame>
              <PlayerLoading />
            </PlayerFrame>
          }
        >
          <ResolvedViewerRoom params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function ResolvedViewerRoom({
  params,
}: Pick<PageProps<"/watch/[id]">, "params">) {
  const { id } = await params;
  if (!isValidRoomId(id)) notFound();

  return <ViewerRoom roomId={id} />;
}
