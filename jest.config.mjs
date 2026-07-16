import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

// react-markdown and its remark/rehype dependency chain ship as ESM-only
// packages. next/jest ignores all of node_modules for transform unless a
// package is listed in next.config's transpilePackages, so these are
// transformed here instead — scoped to Jest only, no production build impact.
const ESM_PACKAGES = [
  'react-markdown', 'remark-gfm', 'rehype-raw',
  'unified', 'bail', 'is-plain-obj', 'trough', 'vfile', 'vfile-message',
  'unist-util-.*', 'unist-builder',
  'mdast-util-.*', 'micromark.*', 'decode-named-character-reference',
  'character-entities.*', 'property-information', 'space-separated-tokens',
  'comma-separated-tokens', 'hast-util-.*', 'hastscript', 'hast-.*',
  'web-namespaces', 'zwitch', 'html-void-elements', 'stringify-entities',
  'ccount', 'escape-string-regexp', 'markdown-table', 'longest-streak',
  'devlop', 'trim-lines', 'parse-entities', 'remark-.*', 'rehype-.*',
  'hast-util-to-jsx-runtime', 'estree-util-is-identifier-name',
  'inline-style-parser', 'style-to-object', 'style-to-js',
  'html-url-attributes', 'vfile-location',
]

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.ts', '**/tests/unit/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
}

export default async () => {
  const resolved = await createJestConfig(config)()
  resolved.transformIgnorePatterns = [
    `/node_modules/(?!(${ESM_PACKAGES.join('|')})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return resolved
}
