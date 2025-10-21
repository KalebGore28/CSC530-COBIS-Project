import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './src/graphql/schema.graphql',
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string'
      }
    },
    './persisted-queries/client.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['@replit/graphql-codegen-persisted-queries'],
      config: {
        output: 'client',
        algorithm: 'sha256' // Already default, but being explicit
      },
    },
    './persisted-queries/server.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['@replit/graphql-codegen-persisted-queries'],
      config: {
        output: 'server',
        algorithm: 'sha256' // Already default, but being explicit
      },
    }
  }
}

export default config