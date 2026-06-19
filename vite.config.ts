import { defineConfig } from "vite-plus";
import type { PackUserConfig } from "vite-plus/pack";

const runtimeBundleOutputs = ["nonce/scripts/skill-runtime.mjs"];
const scriptBundleOutputPatterns = ["nonce/scripts/**/*.mjs", "nonce/scripts/**/*.js"];
const staleChunkOutputPatterns = [
  "nonce/scripts/argv-*.js",
  "nonce/scripts/argv-*.mjs",
  "nonce/scripts/cli-options-*.js",
  "nonce/scripts/cli-options-*.mjs",
  "nonce/scripts/runtime-*.js",
  "nonce/scripts/runtime-*.mjs",
];
const staleScriptBundleOutputs = [
  "nonce/scripts/auth.js",
  "nonce/scripts/bootstrap-runtime.js",
  "nonce/scripts/run-task.js",
  "nonce/scripts/skill-runtime.js",
];
const skillScriptBundleOutputs = [
  "nonce/scripts/auth.mjs",
  "nonce/scripts/bootstrap-runtime.mjs",
  "nonce/scripts/run-task.mjs",
];
const generatedAssetOutputs = [
  "nonce/assets/tool-signatures.ts",
  "nonce/assets/tool-manifest.json",
  "nonce/assets/tool-schemas.json",
];
const generatedBundleOutputs = [
  ...runtimeBundleOutputs,
  ...skillScriptBundleOutputs,
  ...staleScriptBundleOutputs,
  ...staleChunkOutputPatterns,
  ...generatedAssetOutputs,
  ...scriptBundleOutputPatterns,
  ".pnpm-store/**",
];
const taskInputExcludes = [".pnpm-store/**"];
const createScriptPack = (
  name: string,
  outputName: string,
  entry: string,
  clean: string[] = [
    `nonce/scripts/${outputName}.mjs`,
    `nonce/scripts/${outputName}.js`,
    ...staleChunkOutputPatterns,
  ],
): PackUserConfig => ({
  clean,
  dts: false,
  deps: {
    onlyBundle: false,
  },
  entry: {
    [outputName]: entry,
  },
  fixedExtension: true,
  format: "esm",
  minify: true,
  name,
  outDir: "nonce/scripts",
});

export default defineConfig({
  fmt: {
    ignorePatterns: generatedBundleOutputs,
    lineWidth: 120,
    quotes: "single",
    semicolons: false,
    trailingCommas: "all",
  },
  pack: [
    createScriptPack("runtime", "skill-runtime", "src/runtime/index.ts", [
      ...runtimeBundleOutputs,
      "nonce/scripts/skill-runtime.js",
      ...staleChunkOutputPatterns,
    ]),
    createScriptPack("skill-script-auth", "auth", "src/skill-scripts/auth.ts"),
    createScriptPack(
      "skill-script-bootstrap-runtime",
      "bootstrap-runtime",
      "src/skill-scripts/bootstrap-runtime.ts",
    ),
    createScriptPack("skill-script-run-task", "run-task", "src/skill-scripts/run-task.ts"),
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
        command: "vp run generate:nonce-sdk",
        dependsOn: ["build:runtime", "build:scripts"],
      },
      "build:runtime": {
        command: "vp pack --filter runtime",
        input: [
          { auto: true },
          ...runtimeBundleOutputs.map((path) => `!${path}`),
          ...staleScriptBundleOutputs.map((path) => `!${path}`),
          ...staleChunkOutputPatterns.map((path) => `!${path}`),
          ...taskInputExcludes.map((path) => `!${path}`),
        ],
        output: runtimeBundleOutputs,
      },
      "build:scripts": {
        command: [
          "vp pack --filter skill-script-auth",
          "vp pack --filter skill-script-bootstrap-runtime",
          "vp pack --filter skill-script-run-task",
        ],
        input: [
          { auto: true },
          ...skillScriptBundleOutputs.map((path) => `!${path}`),
          ...staleScriptBundleOutputs.map((path) => `!${path}`),
          ...staleChunkOutputPatterns.map((path) => `!${path}`),
          ...taskInputExcludes.map((path) => `!${path}`),
        ],
        output: skillScriptBundleOutputs,
      },
      "generate:nonce-sdk": {
        cache: false,
        command: "node --import tsx scripts/generate-nonce-sdk.ts",
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
