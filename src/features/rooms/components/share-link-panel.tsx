"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShareableWatchUrl } from "@/features/rooms/lib/paths";

const subscribeNoop = () => () => {};

function useOrigin(): string {
  return useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => "",
  );
}

interface ShareLinkPanelProps {
  roomId: string;
}

export function ShareLinkPanel({ roomId }: ShareLinkPanelProps) {
  const origin = useOrigin();
  const url = getShareableWatchUrl(roomId, origin || undefined);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <Panel
      title="Link da sala"
      icon={Link2}
      description="Envie apenas para quem deve assistir."
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
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        ID: {roomId}
      </p>
    </Panel>
  );
}
