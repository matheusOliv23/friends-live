"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Link2, Monitor } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestDesktopHandoff,
  RoomApiError,
} from "@/features/rooms/api/client";
import { getShareableWatchUrl } from "@/features/rooms/lib/paths";

const subscribeNoop = () => () => {};

function useOrigin(): string {
  return useSyncExternalStore(
    subscribeNoop,
    () =>
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin,
    () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "",
  );
}

function isNexusDesktop(): boolean {
  return Boolean(
    (
      globalThis as typeof globalThis & {
        nexusDesktop?: unknown;
      }
    ).nexusDesktop,
  );
}

interface ShareLinkPanelProps {
  roomId: string;
}

export function ShareLinkPanel({ roomId }: ShareLinkPanelProps) {
  const origin = useOrigin();
  const url = getShareableWatchUrl(roomId, origin || undefined);
  const [copied, setCopied] = useState(false);
  const [desktopBusy, setDesktopBusy] = useState(false);
  const [desktopError, setDesktopError] = useState<string | null>(null);
  const [desktopMode, setDesktopMode] = useState<"web" | "desktop" | null>(
    null,
  );

  useEffect(() => {
    setDesktopMode(isNexusDesktop() ? "desktop" : "web");
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const input = document.getElementById(
        "share-link-input",
      ) as HTMLInputElement | null;
      input?.select();
    }
  }

  async function handleOpenDesktop() {
    setDesktopBusy(true);
    setDesktopError(null);
    try {
      const { deepLink } = await requestDesktopHandoff(roomId);
      window.location.href = deepLink;
    } catch (error) {
      setDesktopError(
        error instanceof RoomApiError
          ? error.message
          : "Não foi possível abrir o app desktop.",
      );
    } finally {
      setDesktopBusy(false);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <Panel
      title="Link da sala"
      icon={Link2}
      description="Link fixo da sala — pode reutilizar nas próximas transmissões."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="share-link-input"
          value={url}
          readOnly
          className="h-10 bg-background font-mono text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant={copied ? "secondary" : "outline"}
          size="lg"
          onClick={handleCopy}
          className="h-10 shrink-0 px-4"
        >
          {copied ? (
            <>
              <Check data-icon="inline-start" />
              Copiado
            </>
          ) : (
            <>
              <Copy data-icon="inline-start" />
              Copiar
            </>
          )}
        </Button>
      </div>
      {desktopMode === "web" ? (
        <div className="mt-3 flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-10 w-full sm:w-auto"
            disabled={desktopBusy}
            onClick={() => void handleOpenDesktop()}
          >
            <Monitor data-icon="inline-start" />
            {desktopBusy ? "Abrindo app…" : "Abrir no app Windows"}
          </Button>
          {desktopError ? (
            <p className="text-xs text-destructive" role="alert">
              {desktopError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Continua a mesma sala; espectadores ficam no link /watch.
            </p>
          )}
        </div>
      ) : null}
      {desktopMode === "desktop" ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 w-full sm:w-auto"
            onClick={() => {
              const bridge = (
                globalThis as typeof globalThis & {
                  nexusDesktop?: { goHome?: () => Promise<void> };
                }
              ).nexusDesktop;
              void bridge?.goHome?.();
            }}
          >
            Voltar ao launcher
          </Button>
        </div>
      ) : null}
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        ID: {roomId}
      </p>
    </Panel>
  );
}
