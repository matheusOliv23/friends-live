"use client";

import { Settings2 } from "lucide-react";
import { Panel } from "@/components/panel";
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
