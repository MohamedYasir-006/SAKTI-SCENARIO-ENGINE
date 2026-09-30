/**
 * Demo loader tests: the shipped demo JSON files must yield valid models.
 */
import { describe, expect, it } from "vitest";
import {
  buildDemoModel,
  buildDemoVariants,
  parseDemoInnovation,
  parseDemoScenarios,
} from "@/lib/demo/demo-loader";
import demoInnovationJson from "@/data/demo/ashwabrahm/innovation.json";
import demoScenariosJson from "@/data/demo/ashwabrahm/scenarios.json";

describe("demo innovation file", () => {
  it("parses and builds a valid model", () => {
    const parsed = parseDemoInnovation(demoInnovationJson);
    expect(parsed.valid).toBe(true);
    const result = buildDemoModel(demoInnovationJson);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.ingredients).toHaveLength(2);
      expect(result.value.targetJurisdictions).toEqual(["IN"]);
      expect(result.value.intendedUse).toEqual(["stress management"]);
    }
  });

  it("rejects malformed demo input", () => {
    const result = buildDemoModel({ form: { ingredients: [] } });
    expect(result.valid).toBe(false);
  });
});

describe("demo scenarios file", () => {
  it("parses and builds valid B/C variants", () => {
    const parsed = parseDemoScenarios(demoScenariosJson);
    expect(parsed.valid).toBe(true);
    const base = buildDemoModel(demoInnovationJson);
    if (!base.valid) throw new Error("Demo base should be valid");
    const variants = buildDemoVariants(base.value, demoScenariosJson);
    expect(variants.valid).toBe(true);
    if (variants.valid) {
      const ashwagandha = variants.variants.versionB.ingredients.find(
        (i) => i.botanicalName === "Ashwagandha"
      );
      expect(ashwagandha?.quantity.amount).toBe(60);
      expect(variants.variants.versionB.processSteps[0]?.action).toBe("Cold maceration");
      expect(variants.variants.versionC.targetJurisdictions).toEqual(["WO"]);
    }
  });
});
