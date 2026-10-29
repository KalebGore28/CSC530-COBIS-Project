import { defineConfig, loadEnv, lazyPlugins } from "vite-plus";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    staged: {
      "*": "vp check --fix",
    },
    lint: {
      plugins: [
        "react",
        "typescript",
        "import",
        "vitest",
        "promise",
        "unicorn",
        "eslint",
        "oxc",
      ],
      categories: {},
      rules: {
        "vite-plus/prefer-vite-plus-imports": "error",
      },
      settings: {
        "jsx-a11y": {
          polymorphicPropName: null,
          components: {},
          attributes: {},
        },
        next: {
          rootDir: [],
        },
        react: {
          formComponents: [],
          linkComponents: [],
          version: null,
          componentWrapperFunctions: [],
        },
        jsdoc: {
          ignorePrivate: false,
          ignoreInternal: false,
          ignoreReplacesDocs: true,
          overrideReplacesDocs: true,
          augmentsExtendsReplacesDocs: false,
          implementsReplacesDocs: false,
          exemptDestructuredRootsFromChecks: false,
          tagNamePreference: {},
        },
        vitest: {
          typecheck: false,
        },
      },
      env: {
        builtin: true,
      },
      globals: {},
      ignorePatterns: [],
      options: {
        typeAware: true,
        typeCheck: true,
      },
      jsPlugins: [
        {
          name: "vite-plus",
          specifier: "vite-plus/oxlint-plugin",
        },
      ],
    },
    test: {
      // Vitest v4 compatibility: preserve mock call history.
      // Remove after tests no longer rely on calls from setup or earlier tests.
      // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
      // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
      clearMocks: false,
      globals: true,
      environment: "node",
    },
    fmt: {
      semi: false,
      singleQuote: true,
      trailingComma: "all",
      tabWidth: 4,
      printWidth: 80,
      sortPackageJson: false,
      sortTailwindcss: {},
      ignorePatterns: [
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "CHANGELOG.md",
        "**/drizzle",
      ],
    },
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: env.PORT ? parseInt(env.PORT) : 3000,
    },
    plugins: lazyPlugins(() => [tailwindcss(), tanstackStart(), viteReact()]),
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
    },
  };
});

export default config;
