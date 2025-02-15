export default {
  testEnvironment: "node",
  moduleFileExtensions: ["js"],
  // Look for test files in the "tests" folder that end with .test.js
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  // No TypeScript transformation – this runs only plain JS
  transform: {},
};
