import express from 'express';

// Import provider adapters to trigger self-registration
import '../src/server/providers/anthropic.js';
import '../src/server/providers/xai.js';
import '../src/server/providers/openai.js';
import '../src/server/providers/google.js';

import { getAllProviders } from '../src/server/providers/registry.js';
import validateRouter from '../src/server/routes/validate.js';

const app = express();

app.use(express.json());

app.get('/api/providers', (_req, res) => {
  res.json(getAllProviders());
});

app.use('/api', validateRouter);

export default app;
