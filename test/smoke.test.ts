import { describe, expect, it } from "vite-plus/test";

import { repositoryName } from "../src/index.js";

describe("skills repository", () => {
  it("exports the package marker", () => {
    expect(repositoryName).toBe("@noncehq/skills");
  });
});
