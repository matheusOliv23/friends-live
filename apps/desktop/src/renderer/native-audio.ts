/**
 * Helpers de áudio no renderer (Fase 2).
 * Isolar o jogo do Discord: roteie o jogo para VB-Cable / VoiceMeeter e
 * selecione esse dispositivo aqui — a live publica essa track sem loopback do sistema.
 */

export async function getVirtualAudioTrack(
  deviceId: string,
): Promise<MediaStreamTrack | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: deviceId },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
    return stream.getAudioTracks()[0] ?? null;
  } catch {
    return null;
  }
}

export function readDesktopAudioPrefs(): {
  audioMode:
    | "app-loopback"
    | "window-only"
    | "system-loopback"
    | "virtual-device";
  selectedDeviceId: string;
} {
  try {
    const raw = localStorage.getItem("nexus.desktop.audioMode");
    if (!raw) {
      return { audioMode: "app-loopback", selectedDeviceId: "" };
    }
    return JSON.parse(raw) as {
      audioMode:
        | "app-loopback"
        | "window-only"
        | "system-loopback"
        | "virtual-device";
      selectedDeviceId: string;
    };
  } catch {
    return { audioMode: "app-loopback", selectedDeviceId: "" };
  }
}
