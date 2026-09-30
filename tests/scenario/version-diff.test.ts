/**
 * Version diff + dependency-map tests (prototype).
 */
import { describe, expect, it } from "vitest";
import {
  affectedModules,
  diffInnovationModels,
} from "@/lib/scenario/version-diff";
import { baseModel, withJurisdiction, withPercentage } from "./fixtures";

describe("diffInnovationModels", () => {
  it("lists a percentage change with old and new values", () => {
    const changes = diffInnovationModels(baseModel(), withPercentage(baseModel(), "Ashwagandha", 70));
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe("percentages");
    expect(changes[0].oldValue).toBe("60%");
    expect(changes[0].newValue).toBe("70%");
  });

  it("lists a jurisdiction change", () => {
    const changes = diffInnovationModels(baseModel(), withJurisdiction(baseModel(), "WO"));
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe("jurisdiction");
    expect(changes[0].oldValue).toBe("IN");
    expect(changes[0].newValue).toBe("WO");
  });

  it("returns no changes for identical models", () => {
    expect(diffInnovationModels(baseModel(), baseModel())).toEqual([]);
  });
});

describe("affectedModules", () => {
  it("maps percentage changes to IP and TK only", () => {
    const changes = diffInnovationModels(baseModel(), withPercentage(baseModel(), "Ashwagandha", 70));
    expect(affectedModules(changes)).toEqual(["ip", "tk"]);
  });

  it("maps jurisdiction changes to all modules", () => {
    const changes = diffInnovationModels(baseModel(), withJurisdiction(baseModel(), "WO"));
    expect(affectedModules(changes)).toEqual(["ip", "tk", "abs", "regulatory"]);
  });
});
