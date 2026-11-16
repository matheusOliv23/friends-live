import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, MonitorUp } from "lucide-react";
import {
  createRoom,
  DesktopApiError,
  fetchRoom,
  loadHostToken,
  saveHostToken,
} from "./api";

type AudioMode =
  | "app-loopback"
  | "window-only"
  | "system-loopback"
  | "virtual-device";

const AUDIO_OPTIONS: Array<{ value: AudioMode; label: string; hint: string }> =
  [
    {
      value: "app-loopback",
      label: "Só o app",
      hint: "Som do jogo, sem Discord",
    },
    {
      value: "system-loopback",
      label: "Sistema",
      hint: "Todo o áudio do PC",
    },
    {
      value: "window-only",
      label: "Mudo",
      hint: "Só vídeo",
    },
    {
      value: "virtual-device",
      label: "Virtual",
      hint: "VB-Cable / VoiceMeeter",
    },
  ];

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="brand-mark"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="rgba(139,92,246,0.15)" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.25"
        stroke="rgba(139,92,246,0.35)"
        strokeWidth="1.5"
      />
      <path
        d="M10 22V10h2.4l5.2 8.2V10H22v12h-2.4L14.4 13.8V22H10Z"
        fill="#8b5cf6"
      />
      <circle cx="23.5" cy="8.5" r="2.25" fill="#ef4444" />
    </svg>
  );
}

export function App() {
  const [siteUrl, setSiteUrl] = useState("https://friends-live.vercel.app");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<AudioMode>("app-loopback");
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  useEffect(() => {
    void (async () => {
      const config = await window.nexusDesktop.getConfig();
      setSiteUrl(config.siteUrl);

      async function applyDeepLink(link: {
        roomId: string;
        hostToken?: string;
      }) {
        setRoomIdInput(link.roomId);
        if (link.hostToken) {
          saveHostToken(link.roomId, link.hostToken);
          setBusy(true);
          setError(null);
          try {
            await window.nexusDesktop.setAudioPrefs({
              audioMode,
              selectedDeviceId,
            });
            const result = await window.nexusDesktop.openStream({
              roomId: link.roomId,
              hostToken: link.hostToken,
            });
            if (!result.ok) {
              throw new Error("Não foi possível abrir o estúdio no desktop.");
            }
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Falha ao abrir deep link.",
            );
          } finally {
            setBusy(false);
          }
        }
      }

      const deepLinked =
        (await window.nexusDesktop.consumeDeepLink()) || config.pendingDeepLink;
      if (deepLinked) {
        await applyDeepLink(deepLinked);
      }

      window.nexusDesktop.onDeepLink((link) => {
        void applyDeepLink(link);
      });

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((device) => device.kind === "audioinput");
        setAudioDevices(inputs);
        if (inputs[0]) setSelectedDeviceId(inputs[0].deviceId);
      } catch {
        // permission may be required later
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once
  }, []);

  async function openHostStudio(roomId: string, hostToken?: string | null) {
    await window.nexusDesktop.setAudioPrefs({ audioMode, selectedDeviceId });
    const result = await window.nexusDesktop.openStream({
      roomId,
      hostToken: hostToken ?? loadHostToken(roomId),
    });
    if (!result.ok) {
      throw new Error("Não foi possível abrir o estúdio no desktop.");
    }
  }

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const { room, hostToken } = await createRoom(siteUrl);
      saveHostToken(room.id, hostToken);
      setRoomIdInput(room.id);
      // Libera o botão antes de navegar — se o usuário voltar ao launcher, não fica preso.
      setBusy(false);
      await openHostStudio(room.id, hostToken);
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof DesktopApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao criar a sala.",
      );
    }
  }

  async function handleOpen(event: FormEvent) {
    event.preventDefault();
    const roomId = roomIdInput.trim();
    if (!roomId) {
      setError("Informe o ID da sala.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const hostToken = loadHostToken(roomId);
      const result = await fetchRoom(siteUrl, roomId, hostToken);
      if (result.room.status === "ended") {
        throw new Error("Esta sala já foi encerrada.");
      }
      if (!result.isHost && !hostToken) {
        throw new Error(
          "Sem token de anfitrião. Crie a sala aqui ou, no site, use “Abrir no app Windows”.",
        );
      }
      await openHostStudio(roomId, hostToken);
    } catch (err) {
      setError(
        err instanceof DesktopApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível abrir a sala.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openWatchHome() {
    void window.nexusDesktop.openExternal(`${siteUrl}/watch`);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <BrandMark />
          <span>
            Nexus <span className="brand-muted">Stream</span>
          </span>
        </div>
        <button type="button" className="link-ghost" onClick={openWatchHome}>
          Assistir
        </button>
      </header>

      <main className="main">
        <div className="cta-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void handleCreate()}
          >
            <MonitorUp size={18} aria-hidden />
            {busy ? "Preparando…" : "Iniciar transmissão"}
            <ArrowRight size={16} aria-hidden />
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={openWatchHome}
          >
            <Eye size={18} aria-hidden />
            Assistir transmissão
          </button>
        </div>

        <div className="showcase">
          <div className="showcase-glow showcase-glow-a" aria-hidden />
          <div className="showcase-glow showcase-glow-b" aria-hidden />
          <div className="showcase-frame">
            <div className="showcase-shimmer" aria-hidden />
            <div className="showcase-stage">
              <div className="live-badge">
                <span className="live-dot" aria-hidden />
                Ao vivo
              </div>
              <div className="showcase-bar">
                <div className="showcase-meta">
                  <span className="live-dot" aria-hidden />
                  <span>Nexus Stream</span>
                  <span className="dim">· 1080p · 60 fps</span>
                </div>
                <div className="showcase-controls" aria-hidden>
                  <span className="pill pill-a" />
                  <span className="pill pill-b" />
                  <span className="pill-box" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <details className="advanced">
          <summary>Mais opções</summary>
          <div className="advanced-panel">
            <div className="field">
              <label htmlFor="audio-mode">Modo de áudio na captura</label>
              <select
                id="audio-mode"
                value={audioMode}
                onChange={(event) =>
                  setAudioMode(event.target.value as AudioMode)
                }
              >
                <option value="app-loopback">
                  Áudio só do app (recomendado — sem eco Discord)
                </option>
                <option value="system-loopback">
                  Áudio do sistema inteiro (pode incluir Discord)
                </option>
                <option value="window-only">Só vídeo da janela (mudo)</option>
                <option value="virtual-device">
                  Dispositivo virtual (VB-Cable / VoiceMeeter)
                </option>
              </select>
            </div>
            {audioMode === "virtual-device" ? (
              <div className="field">
                <label htmlFor="audio-device">Dispositivo de entrada</label>
                <select
                  id="audio-device"
                  value={selectedDeviceId}
                  onChange={(event) => setSelectedDeviceId(event.target.value)}
                >
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Áudio ${device.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <form className="field" onSubmit={(event) => void handleOpen(event)}>
              <label htmlFor="room-id">Abrir sala existente</label>
              <input
                id="room-id"
                value={roomIdInput}
                onChange={(event) => setRoomIdInput(event.target.value)}
                placeholder="ID da sala"
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-outline"
                disabled={busy}
                style={{ marginTop: 8, width: "100%" }}
              >
                Abrir estúdio
              </button>
            </form>
          </div>
        </details>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
      </main>

      <footer className="footer">
        Nexus Stream — transmissão privada de tela.
      </footer>
    </div>
  );
}
