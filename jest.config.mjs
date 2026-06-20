import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: {
    // ESM-only packages stubbed for the test runner.
    "^react-markdown$": "<rootDir>/tests/__mocks__/react-markdown.tsx",
    "^remark-gfm$": "<rootDir>/tests/__mocks__/remark-gfm.ts",
    "^uuid$": "<rootDir>/tests/__mocks__/uuid.ts",
  },
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/*.d.ts", "!**/node_modules/**", "!**/.next/**"],
};

export default createJestConfig(config);
