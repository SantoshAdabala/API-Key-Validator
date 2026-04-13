import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import provider adapters to trigger their self-registration
import './providers/anthropic.js';
import './providers/xai.js';
import './providers/openai.js';
import './providers/google.js';

import { getAllProviders } from './providers/registry.js';
import validateRouter from './routes/validate.js';

const app = express();

app.use(express.json());

app.get('/api/providers', (_req, res) => {
  res.json(getAllProviders());
});

app.use('/api', validateRouter);

// Serve static frontend assets in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../dist/client');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
