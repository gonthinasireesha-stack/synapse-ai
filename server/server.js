// server.js
//
// Entry point. Responsibilities ONLY:
//   1. Validate env (importing env.js triggers validation — fail fast)
//   2. Verify DB connectivity
//   3. Start listening for HTTP requests
//
// All actual app logic (middleware, routes) lives in src/app.js

import { app } from './src/app.js';
import { env } from './src/config/env.js';
import { verifyDbConnection } from './src/config/db.js';

async function start() {
  await verifyDbConnection();

  app.listen(env.port, () => {
    console.log(`🚀 Synapse AI server running on http://localhost:${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
  });
}

start();