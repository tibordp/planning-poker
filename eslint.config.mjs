import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  prettier,
  {
    rules: {
      // The app intentionally synchronises local state from props inside effects
      // (e.g. resetting dialog fields when reopened). This is preserved behaviour
      // from before the upgrade, so we don't treat the newer react-hooks rule as
      // an error.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
