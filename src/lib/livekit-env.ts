import { AppError } from "@/lib/http";

export interface LiveKitServerConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

export function getLiveKitServerConfig(): LiveKitServerConfig {
  const url = process.env.LIVEKIT_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();

  if (!url || !apiKey || !apiSecret) {
    throw new AppError(
      "A transmissão em tempo real ainda não está configurada neste ambiente.",
      503,
      "livekit_not_configured",
    );
  }

  return { url, apiKey, apiSecret };
}
