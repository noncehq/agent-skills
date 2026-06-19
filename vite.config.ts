import { defineConfig } from "vite-plus";

const runtimeBundleOutputs = ["nonce/scripts/skill-runtime.js"];
const scriptBundleOutputPattern = "nonce/scripts/**/*.js";
const generatedAssetOutputs = [
  "nonce/assets/tool-signatures.ts",
  "nonce/assets/tool-manifest.json",
  "nonce/assets/tool-schemas.json",
];
const generatedBundleOutputs = [
  ...runtimeBundleOutputs,
  ...generatedAssetOutputs,
  scriptBundleOutputPattern,
  ".pnpm-store/**",
];
const taskInputExcludes = [".pnpm-store/**"];

export default defineConfig({
  fmt: {
    ignorePatterns: generatedBundleOutputs,
    lineWidth: 120,
    quotes: "single",
    semicolons: false,
    trailingCommas: "all",
  },
  pack: [
    {
      clean: false,
      dts: false,
      deps: {
        onlyBundle: false,
      },
      entry: {
        "skill-runtime": "src/runtime/index.ts",
      },
      fixedExtension: false,
      format: "esm",
      name: "runtime",
      outDir: "nonce/scripts",
    },
    {
      clean: false,
      dts: false,
      deps: {
        onlyBundle: false,
      },
      entry: {
        auth: "src/skill-scripts/auth.ts",
        "bootstrap-runtime": "src/skill-scripts/bootstrap-runtime.ts",
        "run-task": "src/skill-scripts/run-task.ts",
      },
      fixedExtension: false,
      format: "esm",
      name: "skill-scripts",
      outDir: "nonce/scripts",
    },
  ],
  lint: {
    ignorePatterns: generatedBundleOutputs,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      build: {
        cache: false,
        command: "vp run nonce:generate-sdk",
        dependsOn: ["build:runtime", "build:scripts"],
      },
      "build:runtime": {
        command: "vp pack --filter runtime",
        input: [
          { auto: true },
          ...runtimeBundleOutputs.map((path) => `!${path}`),
          ...taskInputExcludes.map((path) => `!${path}`),
        ],
        output: runtimeBundleOutputs,
      },
      "build:scripts": {
        command: "vp pack --filter skill-scripts",
        input: [
          { auto: true },
          `!${scriptBundleOutputPattern}`,
          ...taskInputExcludes.map((path) => `!${path}`),
        ],
        output: [scriptBundleOutputPattern],
      },
      "nonce:generate-sdk": {
        cache: false,
        command: "tsx scripts/generate-nonce-sdk.ts",
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["test/**/*.test.ts", "src/**/*.test.ts", "nonce/**/*.test.ts"],
  },
});
