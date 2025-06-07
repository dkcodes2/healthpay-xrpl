import type { NextApiRequest, NextApiResponse } from 'next';
import { mintRLUSD } from '../../lib/xrpl-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { toAddress, amount, memo } = req.body;
    if (!toAddress || !amount) {
      return res.status(400).json({ error: 'toAddress and amount are required' });
    }
    const result = await mintRLUSD(toAddress, amount, memo);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 