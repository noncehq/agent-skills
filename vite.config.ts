import { defineConfig } from "vite-plus";
import type { PackUserConfig } from "vite-plus/pack";

const runtimeBundleOutputs = ["nonce/scripts/skill-runtime.js"];
const scriptBundleOutputPattern = "nonce/scripts/**/*.js";
const staleChunkOutputPatterns = [
  "nonce/scripts/argv-*.js",
  "nonce/scripts/cli-options-*.js",
  "nonce/scripts/runtime-*.js",
];
const skillScriptBundleOutputs = [
  "nonce/scripts/auth.js",
  "nonce/scripts/bootstrap-runtime.js",
  "nonce/scripts/run-task.js",
];
const generatedAssetOutputs = [
  "nonce/assets/tool-signatures.ts",
  "nonce/assets/tool-manifest.json",
  "nonce/assets/tool-schemas.json",
];
const generatedBundleOutputs = [
  ...runtimeBundleOutputs,
  ...skillScriptBundleOutputs,
  ...staleChunkOutputPatterns,
  ...generatedAssetOutputs,
  scriptBundleOutputPattern,
  ".pnpm-store/**",
];
const taskInputExcludes = [".pnpm-store/**"];
const createScriptPack = (
  name: string,
  outputName: string,
  entry: string,
  clean: string[] = [`nonce/scripts/${outputName}.js`, ...staleChunkOutputPatterns],
): PackUserConfig => ({
  clean,
  dts: false,
  deps: {
    onlyBundle: false,
  },
  entry: {
    [outputName]: entry,
  },
  fixedExtension: false,
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
        command: "vp run nonce:generate-sdk",
        dependsOn: ["build:runtime", "build:scripts"],
      },
      "build:runtime": {
        command: "vp pack --filter runtime",
        input: [
          { auto: true },
          ...runtimeBundleOutputs.map((path) => `!${path}`),
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
          ...staleChunkOutputPatterns.map((path) => `!${path}`),
          ...taskInputExcludes.map((path) => `!${path}`),
        ],
        output: skillScriptBundleOutputs,
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
