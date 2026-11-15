import type { ScreenCaptureErrorCode } from "@/features/streaming/types/capture";

export interface ClassifiedCaptureError {
  code: ScreenCaptureErrorCode;
  message: string;
}

const FRIENDLY_MESSAGES: Record<ScreenCaptureErrorCode, string> = {
  unsupported:
    "Seu navegador não oferece compartilhamento de tela. Tente usar o Chrome, Edge ou Firefox atualizado.",
  permission_denied:
    "A permissão para compartilhar a tela foi negada. Verifique as configurações do navegador e tente novamente.",
  cancelled: "O compartilhamento foi cancelado antes de começar.",
  not_found: "Não encontramos uma tela ou janela disponível para compartilhar.",
  not_readable:
    "Não foi possível acessar a tela selecionada. Feche outros programas que possam estar usando a captura e tente de novo.",
  overconstrained:
    "Não foi possível aplicar a qualidade solicitada. Tente outra resolução ou taxa de quadros.",
  unknown: "Não foi possível iniciar o compartilhamento de tela. Tente novamente.",
};

export function getFriendlyCaptureMessage(code: ScreenCaptureErrorCode): string {
  return FRIENDLY_MESSAGES[code];
}

export function classifyCaptureError(error: unknown): ClassifiedCaptureError {
  if (!isDomException(error) && !(error instanceof Error)) {
    return { code: "unknown", message: FRIENDLY_MESSAGES.unknown };
  }

  const name = error.name;
  const message = error.message.toLowerCase();

  if (name === "NotAllowedError") {
    // Alguns navegadores usam NotAllowedError tanto para cancelamento quanto para negação.
    if (
      message.includes("dismiss") ||
      message.includes("cancel") ||
      message.includes("aborted")
    ) {
      return { code: "cancelled", message: FRIENDLY_MESSAGES.cancelled };
    }
    return {
      code: "permission_denied",
      message: FRIENDLY_MESSAGES.permission_denied,
    };
  }

  if (name === "AbortError") {
    return { code: "cancelled", message: FRIENDLY_MESSAGES.cancelled };
  }

  if (name === "NotFoundError") {
    return { code: "not_found", message: FRIENDLY_MESSAGES.not_found };
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return { code: "not_readable", message: FRIENDLY_MESSAGES.not_readable };
  }

  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return {
      code: "overconstrained",
      message: FRIENDLY_MESSAGES.overconstrained,
    };
  }

  if (name === "NotSupportedError" || name === "TypeError") {
    return { code: "unsupported", message: FRIENDLY_MESSAGES.unsupported };
  }

  return { code: "unknown", message: FRIENDLY_MESSAGES.unknown };
}

function isDomException(error: unknown): error is DOMException {
  return typeof DOMException !== "undefined" && error instanceof DOMException;
}
