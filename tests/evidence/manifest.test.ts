/**
 * Corpus manifest validation tests (Phase 2).
 * No real entries are asserted; the shipped manifest starts empty.
 */
import { describe, expect, it } from "vitest";
import {
  loadManifestFile,
  validateManifestData,
} from "@/lib/evidence/manifest";

describe("validateManifestData", () => {
  it("accepts an empty manifest", () => {
    const result = validateManifestData({ manifestVersion: 1, items: [] });
    expect(result.valid).toBe(true);
    expect(result.manifest?.items).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("rejects an item missing a required field", () => {
    const result = validateManifestData({
      manifestVersion: 1,
      items: [
        {
          id: "item-1",
          // title intentionally missing
          sourceCategory: "literature",
          jurisdiction: "IN",
          origin: "https://example.invalid/item-1",
          license: "unknown",
          retrievedDate: "2026-09-30",
          version: 1,
          contentHash: "abc123",
          verificationStatus: "pending",
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.manifest).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects an unparseable retrieved date", () => {
    const result = validateManifestData({
      manifestVersion: 1,
      items: [
        {
          id: "item-1",
          title: "Illustrative item",
          sourceCategory: "literature",
          jurisdiction: "IN",
          origin: "https://example.invalid/item-1",
          license: "unknown",
          retrievedDate: "not-a-date",
          version: 1,
          contentHash: "abc123",
          verificationStatus: "pending",
        },
      ],
    });
    expect(result.valid).toBe(false);
  });
});

describe("loadManifestFile", () => {
  it("loads the shipped (empty) manifest", async () => {
    const result = await loadManifestFile();
    expect(result.errors).toEqual([]);
    expect(result.manifest?.items).toEqual([]);
  });
});
