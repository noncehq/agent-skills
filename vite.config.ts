import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    lineWidth: 120,
    quotes: "single",
    semicolons: false,
    trailingCommas: "all",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["test/**/*.test.ts", "src/**/*.test.ts", "nonce/**/*.test.ts"],
  },
});
