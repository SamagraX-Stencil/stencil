module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transform: {
      transform_regex: ['ts-jest', {tsconfig:'tsconfig.json'}],
    },
  };

