import type { NextApiRequest, NextApiResponse } from 'next';
import { getRLUSDBalance, getClient } from '../../../lib/xrpl-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'address is required' });
    }
    const rlusd = await getRLUSDBalance(address);
    const client = await getClient();
    const xrp = await client.getXrpBalance(address);
    return res.status(200).json({ address, rlusd, xrp });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 