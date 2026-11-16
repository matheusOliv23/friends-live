/// <reference types="vite/client" />

import type { NexusDesktopApi } from "../shared/desktop-api";

declare global {
  interface Window {
    nexusDesktop: NexusDesktopApi;
  }
}

export {};
