import koffi from "koffi";

const user32 = koffi.load("user32.dll");

const GetWindowThreadProcessId = user32.func(
  "uint32 __stdcall GetWindowThreadProcessId(void *hWnd, _Out_ uint32 *lpdwProcessId)",
);
const GetClassNameW = user32.func(
  "int __stdcall GetClassNameW(void *hWnd, uint16 *lpClassName, int nMaxCount)",
);
const FindWindowExW = user32.func(
  "void * __stdcall FindWindowExW(void *hWndParent, void *hWndChildAfter, const char16 *lpszClass, const char16 *lpszWindow)",
);

/**
 * Extrai HWND do id do desktopCapturer (`window:HWND:...` / `screen:...`).
 */
export function parseHwndFromSourceId(sourceId: string): number | null {
  const parts = sourceId.split(":");
  if (parts[0] !== "window" || !parts[1]) return null;
  const hwnd = Number.parseInt(parts[1], 10);
  return Number.isFinite(hwnd) && hwnd > 0 ? hwnd : null;
}

function readClassName(hwnd: number): string {
  const buf = new Uint16Array(256);
  const len = GetClassNameW(hwnd, buf, buf.length);
  if (!len) return "";
  return String.fromCharCode(...buf.subarray(0, len));
}

/**
 * Resolve PID do processo que realmente renderiza áudio da janela.
 * Em UWP (`ApplicationFrameWindow`) tenta o filho `Windows.UI.Core.CoreWindow`.
 */
export function getPidFromHwnd(hwnd: number): number {
  const pidOut = [0];
  GetWindowThreadProcessId(hwnd, pidOut);
  let pid = pidOut[0] ?? 0;

  const className = readClassName(hwnd);
  if (className === "ApplicationFrameWindow") {
    const core = FindWindowExW(
      hwnd,
      null,
      "Windows.UI.Core.CoreWindow",
      null,
    ) as unknown as number | null;
    if (core) {
      const childPid = [0];
      GetWindowThreadProcessId(core, childPid);
      if (childPid[0]) pid = childPid[0];
    }
  }

  return pid;
}

export function getPidFromCapturerSourceId(sourceId: string): number | null {
  const hwnd = parseHwndFromSourceId(sourceId);
  if (!hwnd) return null;
  const pid = getPidFromHwnd(hwnd);
  return pid > 0 ? pid : null;
}
