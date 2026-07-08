const express = require("express");

// Starts a minimal Express app on an ephemeral port, standing in for a
// downstream microservice. `handler(app)` registers whatever routes the test
// needs on it.
function startStub(handler) {
  const app = express();
  app.use(express.json());
  handler(app);
  const server = app.listen(0);
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { startStub };
