"use client";

import { Settings2, Volume2, VolumeX } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { OptionGroup } from "@/features/streaming/components/broadcaster/option-group";
import {
  CONTENT_HINT_OPTIONS,
  FRAME_RATE_OPTIONS,
  RESOLUTION_OPTIONS,
} from "@/features/streaming/constants/quality";
import type { StreamQualitySettings } from "@/types/streaming";

interface QualitySettingsPanelProps {
  quality: StreamQualitySettings;
  onChange: (patch: Partial<StreamQualitySettings>) => void;
  locked: boolean;
}

export function QualitySettingsPanel({
  quality,
  onChange,
  locked,
}: QualitySettingsPanelProps) {
  const contentHint = CONTENT_HINT_OPTIONS.find(
    (option) => option.value === quality.contentHint,
  );

  return (
    <Panel
      title="Qualidade"
      icon={Settings2}
      description={
        locked
          ? "Encerre o compartilhamento para alterar as configurações."
          : "Solicitadas ao iniciar a captura. O navegador pode entregar valores diferentes."
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Áudio da transmissão
          </p>
          <Button
            type="button"
            variant={quality.includeDisplayAudio ? "secondary" : "outline"}
            size="sm"
            className="w-full justify-start"
            disabled={locked}
            aria-pressed={quality.includeDisplayAudio}
            onClick={() =>
              onChange({
                includeDisplayAudio: !quality.includeDisplayAudio,
              })
            }
          >
            {quality.includeDisplayAudio ? (
              <Volume2 data-icon="inline-start" />
            ) : (
              <VolumeX data-icon="inline-start" />
            )}
            {quality.includeDisplayAudio
              ? "Áudio da aba ligado"
              : "Só vídeo (recomendado com Discord)"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Com Discord, deixe desligado e usem o chat de voz. Se ligar, compartilhe
            só a aba do jogo e marque “Compartilhar áudio” — nunca a tela inteira.
          </p>
        </div>
        <OptionGroup
          label="Resolução"
          value={quality.resolution}
          options={RESOLUTION_OPTIONS}
          onChange={(resolution) => onChange({ resolution })}
          disabled={locked}
        />
        <OptionGroup
          label="Taxa de quadros"
          value={quality.frameRate}
          options={FRAME_RATE_OPTIONS}
          onChange={(frameRate) => onChange({ frameRate })}
          disabled={locked}
        />
        <OptionGroup
          label="Otimização"
          value={quality.contentHint}
          options={CONTENT_HINT_OPTIONS}
          onChange={(hint) => onChange({ contentHint: hint })}
          hint={contentHint?.description}
          disabled={locked}
        />
      </div>
    </Panel>
  );
}
