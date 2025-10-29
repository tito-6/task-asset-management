module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"]
  },
  plugins: ["@typescript-eslint", "prettier", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  rules: {
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always"
      }
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false
      }
    ]
  }
};
