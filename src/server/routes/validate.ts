import { Router, Request, Response } from 'express';
import { getProvider } from '../providers/registry.js';
import { validateApiKey } from '../providers/validator.js';

const validateRouter = Router();

validateRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider) {
      res.status(400).json({
        status: 'error',
        message: 'Provider is required',
        provider: '',
      });
      return;
    }

    const providerConfig = getProvider(provider);
    if (!providerConfig) {
      res.status(400).json({
        status: 'error',
        message: `Unsupported provider: ${provider}`,
        provider,
      });
      return;
    }

    if (!apiKey) {
      res.status(400).json({
        status: 'error',
        message: 'API key is required',
        provider,
      });
      return;
    }

    const result = await validateApiKey(providerConfig, apiKey);
    res.json(result);
  } catch {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      provider: '',
    });
  }
});

export default validateRouter;
