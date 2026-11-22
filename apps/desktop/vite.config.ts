import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { build as esbuild } from "esbuild";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

function copyPickerAssets(): Plugin {
  return {
    name: "copy-picker-assets",
    async closeBundle() {
      const outDir = path.resolve(__dirname, "dist-electron");
      mkdirSync(outDir, { recursive: true });
      copyFileSync(
        path.resolve(__dirname, "src/electron/picker.html"),
        path.join(outDir, "picker.html"),
      );
      await esbuild({
        entryPoints: [
          path.resolve(__dirname, "src/electron/picker-preload.ts"),
        ],
        bundle: true,
        platform: "node",
        format: "cjs",
        outfile: path.join(outDir, "picker-preload.js"),
        external: ["electron"],
        logLevel: "silent",
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, "../.."), "");
  const localEnv = loadEnv(mode, __dirname, "");
  const siteUrl = (
    localEnv.NEXUS_SITE_URL ||
    rootEnv.NEXUS_SITE_URL ||
    rootEnv.NEXT_PUBLIC_SITE_URL ||
    "https://friends-live.vercel.app"
  ).replace(/\/$/, "");
  const cookieSecret =
    localEnv.HOST_COOKIE_SECRET ||
    rootEnv.HOST_COOKIE_SECRET ||
    "nexus-stream-dev-secret";

  const electronDefine = {
    "process.env.NEXUS_SITE_URL": JSON.stringify(siteUrl),
    "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify(siteUrl),
    "process.env.HOST_COOKIE_SECRET": JSON.stringify(cookieSecret),
  };

  return {
    plugins: [
      react(),
      electron({
        main: {
          entry: "src/electron/main.ts",
          vite: {
            define: electronDefine,
            plugins: [copyPickerAssets()],
            build: {
              outDir: "dist-electron",
              rollupOptions: {
                external: [
                  "electron",
                  "electron-updater",
                  "loopback-capture",
                  "koffi",
                  "bindings",
                ],
              },
            },
          },
        },
        preload: {
          input: path.resolve(__dirname, "src/electron/preload.ts"),
          vite: {
            build: {
              outDir: "dist-electron",
            },
          },
        },
        renderer: {},
      }),
    ],
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "src/shared"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: "dist",
    },
  };
});
