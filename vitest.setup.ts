import "dotenv/config";

// Testes unitários não precisam de Postgres real; só evitam file: legado.
if (process.env.DATABASE_URL?.startsWith("file:")) {
  delete process.env.DATABASE_URL;
}

if (typeof MediaStream === "undefined") {
  class MediaStreamPolyfill {
    private tracks: MediaStreamTrack[];

    constructor(tracks: MediaStreamTrack[] = []) {
      this.tracks = [...tracks];
    }

    getTracks() {
      return this.tracks;
    }

    getVideoTracks() {
      return this.tracks.filter((track) => track.kind === "video");
    }

    getAudioTracks() {
      return this.tracks.filter((track) => track.kind === "audio");
    }

    addTrack(track: MediaStreamTrack) {
      this.tracks.push(track);
    }

    removeTrack(track: MediaStreamTrack) {
      this.tracks = this.tracks.filter((item) => item !== track);
    }
  }

  Object.defineProperty(globalThis, "MediaStream", {
    writable: true,
    configurable: true,
    value: MediaStreamPolyfill,
  });
}
