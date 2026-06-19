import { defineConfig } from "vite-plus";
import type { PackUserConfig } from "vite-plus/pack";

const scriptEntries = {
  auth: "src/skill-scripts/auth.ts",
  "bootstrap-runtime": "src/skill-scripts/bootstrap-runtime.ts",
  "run-task": "src/skill-scripts/run-task.ts",
  "skill-runtime": "src/runtime/index.ts",
} as const;

const generatedOutputs = [
  "skills/assets/tool-signatures.ts",
  "skills/assets/tool-manifest.json",
  "skills/assets/tool-schemas.json",
  "skills/assets/schemas/*.md",
  "skills/references/tool-signatures.md",
  "skills/scripts/**/*.mjs",
];
const generatedOutputExcludes = generatedOutputs.map((pattern) => `!${pattern}`);

const createScriptPack = ([name, entry]: [string, string]): PackUserConfig => ({
  clean: [`skills/scripts/${name}.mjs`, `skills/scripts/${name}.js`],
  dts: false,
  deps: {
    onlyBundle: false,
  },
  entry: {
    [name]: entry,
  },
  fixedExtension: true,
  format: "esm",
  minify: true,
  name: `nonce-${name}`,
  outDir: "skills/scripts",
});

export default defineConfig({
  fmt: {
    ignorePatterns: generatedOutputs,
    lineWidth: 120,
    quotes: "single",
    semicolons: false,
    trailingCommas: "all",
  },
  pack: Object.entries(scriptEntries).map(createScriptPack),
  lint: {
    ignorePatterns: generatedOutputs,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      build: {
        cache: true,
        command: ["vp pack", "vp run generate:nonce-sdk"],
        input: [{ auto: true }, ...generatedOutputExcludes],
        output: generatedOutputs,
      },
      "generate:nonce-sdk": {
        cache: false,
        command: "node --import tsx/esm scripts/generate-nonce-sdk.ts",
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
  },
});
