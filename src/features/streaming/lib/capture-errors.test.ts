import { describe, expect, it } from "vitest";
import { classifyCaptureError } from "@/features/streaming/lib/capture-errors";

describe("classifyCaptureError", () => {
  it("classifica cancelamento", () => {
    expect(classifyCaptureError(new DOMException("aborted", "AbortError"))).toMatchObject({
      code: "cancelled",
    });
  });

  it("classifica permissão negada", () => {
    expect(
      classifyCaptureError(new DOMException("Permission denied", "NotAllowedError")),
    ).toMatchObject({ code: "permission_denied" });
  });

  it("classifica NotAllowedError de dismiss como cancelamento", () => {
    expect(
      classifyCaptureError(
        new DOMException("The request is not allowed by user dismiss", "NotAllowedError"),
      ),
    ).toMatchObject({ code: "cancelled" });
  });

  it("classifica navegador incompatível", () => {
    expect(
      classifyCaptureError(new DOMException("not supported", "NotSupportedError")),
    ).toMatchObject({ code: "unsupported" });
  });
});
