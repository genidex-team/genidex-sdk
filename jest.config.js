import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  testRegex: ".*\\.t\\.ts$",
  transform: {
    ...tsJestTransformCfg,
  },
};