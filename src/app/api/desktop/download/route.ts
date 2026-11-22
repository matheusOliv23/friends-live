import { NextResponse } from "next/server";
import {
  DESKTOP_GITHUB,
  desktopReleasesUrl,
  isDesktopSetupAsset,
} from "@/lib/desktop-download";

type GithubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GithubRelease = {
  assets?: GithubReleaseAsset[];
};

/**
 * Redireciona para o instalador Windows (Setup) do release mais recente.
 * Se a API do GitHub falhar ou não houver asset, cai na página de releases.
 */
export async function GET() {
  const apiUrl = `https://api.github.com/repos/${DESKTOP_GITHUB.owner}/${DESKTOP_GITHUB.repo}/releases/latest`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "friends-stream-download",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.redirect(desktopReleasesUrl(), 302);
    }

    const release = (await response.json()) as GithubRelease;
    const setup = release.assets?.find((asset) =>
      isDesktopSetupAsset(asset.name),
    );

    if (!setup?.browser_download_url) {
      return NextResponse.redirect(desktopReleasesUrl(), 302);
    }

    return NextResponse.redirect(setup.browser_download_url, 302);
  } catch {
    return NextResponse.redirect(desktopReleasesUrl(), 302);
  }
}
