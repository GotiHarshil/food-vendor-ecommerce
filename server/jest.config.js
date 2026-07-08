module.exports = {
  testEnvironment: "node",
  // Jest's default testMatch picks up ANY .js file under __tests__/, which
  // would otherwise try (and fail) to run globalSetup.js/globalTeardown.js/
  // helpers/*.js as test suites. Scope discovery to *.test.js only.
  testMatch: ["**/__tests__/**/*.test.js"],
  globalSetup: "./__tests__/globalSetup.js",
  globalTeardown: "./__tests__/globalTeardown.js",
  testTimeout: 20000,
};
