import { LiveKitTokenService } from "@/features/livekit/services/livekit-token.service";
import { getRoomRepository } from "@/features/rooms/repository/prisma-room-repository";

let tokenService: LiveKitTokenService | null = null;

export function getLiveKitTokenService(): LiveKitTokenService {
  tokenService ??= new LiveKitTokenService(getRoomRepository());
  return tokenService;
}
