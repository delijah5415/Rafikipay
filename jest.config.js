/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          // Keep transpilation independent of the app tsconfig so tests run
          // without a full Next.js build.
          module: 'commonjs',
          target: 'ES2020',
          esModuleInterop: true,
          isolatedModules: true,
          strict: false,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/services/**/*.ts',
    'src/config/**/*.ts',
    '!src/lib/db.ts',
    '!src/lib/prisma.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
};
